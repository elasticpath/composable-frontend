import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { AnySchema } from "@modelcontextprotocol/sdk/server/zod-compat.js"
import type {
  CallToolResult,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js"
import * as z from "zod"

export type OperationMeta = {
  id: string
  method: string
  path: string
  risk: "read" | "create" | "update" | "delete"
}

export type ToolConfig = {
  title?: string
  description?: string
  inputSchema: z.ZodObject<Record<string, z.ZodType<any>>>
  outputSchema?: AnySchema
  annotations?: ToolAnnotations
  _meta: {
    "com.elasticpath/operation": OperationMeta
  }
}

export type Tool = {
  readonly name: string
  readonly config: ToolConfig
  readonly handler: ToolCallback<AnySchema>
}

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : JSON.stringify(error)

export const toToolResult = async (
  request: Promise<{
    data?: unknown
    error?: unknown
    response?: Response
  }>,
): Promise<CallToolResult> => {
  let text: string
  try {
    const result = await request
    if (result.error === undefined) {
      const structuredContent =
        typeof result.data === "object" &&
        result.data !== null &&
        !Array.isArray(result.data)
          ? (result.data as Record<string, unknown>)
          : { data: result.data ?? null }
      return {
        structuredContent,
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
      }
    }
    text = result.response
      ? `HTTP ${result.response.status}: ${JSON.stringify(result.error)}`
      : messageOf(result.error)
  } catch (error) {
    text = messageOf(error)
  }
  return { isError: true, content: [{ type: "text", text }] }
}

export const loose = <T extends z.ZodType>(schema: T): T => {
  const def: any = schema._zod.def
  const copy = (changes: object): T =>
    schema.clone({ ...def, ...changes }, { parent: true })
  if (def.type === "object") {
    return copy({
      catchall: z.unknown(),
      shape: Object.fromEntries(
        Object.keys(def.shape).map((key) => [key, loose(def.shape[key])]),
      ),
    })
  }
  if (def.type === "array") {
    return copy({ element: loose(def.element) })
  }
  if (def.type === "record") {
    return copy({ valueType: loose(def.valueType) })
  }
  if (def.type === "lazy") {
    return copy({ getter: () => loose(def.getter()) })
  }
  if (
    [
      "optional",
      "nullable",
      "default",
      "readonly",
      "nonoptional",
      "catch",
      "prefault",
    ].includes(def.type)
  ) {
    return copy({ innerType: loose(def.innerType) })
  }
  if (def.type === "union") {
    return copy({ options: def.options.map(loose) })
  }
  if (def.type === "intersection") {
    return copy({ left: loose(def.left), right: loose(def.right) })
  }
  return schema
}

type FileNameFields<K extends string> = {
  [P in `${K}_name`]: z.ZodOptional<z.ZodString>
}

export const dataUriFields = <
  S extends z.ZodRawShape,
  C extends z.core.$ZodObjectConfig,
  K extends string,
>(
  schema: z.ZodObject<S, C>,
  fields: ReadonlyArray<K>,
  maxBytes: number,
): z.ZodObject<z.core.util.Extend<S, FileNameFields<K>>, C> =>
  schema.extend(
    Object.fromEntries(
      fields.flatMap((field) => {
        const current = schema.shape[field] as unknown as z.ZodType
        const uri = z.string().meta({
          format: "uri",
          "x-mcp-file": { maxSize: maxBytes },
          description: [
            current.description,
            `Send the file as a data: URI, such as data:text/csv;base64,<base64 bytes>, at most ${maxBytes} bytes once decoded.`,
          ]
            .filter(Boolean)
            .join(" "),
        })
        const name = z
          .string()
          .meta({
            description: `The name of the file sent in ${field}, such as products.csv.`,
          })
          .optional()
        return [
          [field, current.isOptional() ? uri.optional() : uri],
          [`${field}_name`, name],
        ]
      }),
    ),
  ) as unknown as z.ZodObject<z.core.util.Extend<S, FileNameFields<K>>, C>

type DataUrisDecoded<T, K extends string> = T extends object
  ? Omit<T, K | `${K}_name`> & {
      [P in K & keyof T]: undefined extends T[P] ? File | undefined : File
    }
  : T

const DATA_URI = /^data:([^,]*),(.*)$/is
const PERCENT_ENCODED = /^[0-9a-f]{2}$/i

const notADataUriError = (field: string) =>
  new Error(
    `${field} must be a data: URI, such as data:image/png;base64,iVBORw0KGgo. This tool does not download URLs.`,
  )

const fileTooBigError = (field: string, bytes: number, maxBytes: number) =>
  new Error(
    `${field} is ${bytes} bytes, over the ${maxBytes} bytes this tool accepts`,
  )

function percentDecoded(field: string, text: string) {
  const bytes: number[] = []
  const encoder = new TextEncoder()
  for (let index = 0; index < text.length; index++) {
    if (text[index] === "%") {
      const hex = text.slice(index + 1, index + 3)
      if (!PERCENT_ENCODED.test(hex)) throw notADataUriError(field)
      bytes.push(parseInt(hex, 16))
      index += 2
    } else {
      const codePoint = text.codePointAt(index)!
      const character = String.fromCodePoint(codePoint)
      bytes.push(...encoder.encode(character))
      index += character.length - 1
    }
  }
  return new Uint8Array(bytes)
}

function base64Decoded(field: string, text: string, maxBytes: number) {
  const data = text.replace(/\s/g, "")
  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0
  const bytes = Math.floor((data.length * 3) / 4) - padding
  if (bytes > maxBytes) throw fileTooBigError(field, bytes, maxBytes)
  let binary: string
  try {
    binary = atob(data)
  } catch {
    throw new Error(`${field} is not valid base64`)
  }
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function fileFromDataUri(
  field: string,
  uri: unknown,
  maxBytes: number,
  givenName: unknown,
) {
  const match = typeof uri === "string" ? DATA_URI.exec(uri) : null
  if (!match) throw notADataUriError(field)
  const parameters = match[1]!.split(";")
  const isBase64 = parameters.at(-1)!.toLowerCase() === "base64"
  if (isBase64) parameters.pop()
  const mediaType = parameters.shift()!.trim()
  const nameParameter = parameters.find((parameter) =>
    parameter.trim().toLowerCase().startsWith("name="),
  )
  let name = field
  if (typeof givenName === "string" && givenName.trim()) {
    name = givenName.trim()
  } else if (nameParameter) {
    try {
      name = decodeURIComponent(nameParameter.trim().slice("name=".length))
    } catch {
      throw notADataUriError(field)
    }
  }
  const bytes = isBase64
    ? base64Decoded(field, match[2]!, maxBytes)
    : percentDecoded(field, match[2]!)
  if (bytes.length > maxBytes)
    throw fileTooBigError(field, bytes.length, maxBytes)
  return new File([bytes], name, {
    type: mediaType.includes("/") ? mediaType : "text/plain",
  })
}

export const decodeDataUris = async <T, K extends string>(
  body: T,
  fields: ReadonlyArray<K>,
  maxBytes: number,
): Promise<DataUrisDecoded<T, K>> => {
  if (typeof body !== "object" || body === null) {
    return body as DataUrisDecoded<T, K>
  }
  const decoded = { ...body } as Record<string, unknown>
  for (const field of fields) {
    const givenName = decoded[`${field}_name`]
    delete decoded[`${field}_name`]
    if (decoded[field] !== undefined) {
      decoded[field] = fileFromDataUri(
        field,
        decoded[field],
        maxBytes,
        givenName,
      )
    }
  }
  return decoded as DataUrisDecoded<T, K>
}
