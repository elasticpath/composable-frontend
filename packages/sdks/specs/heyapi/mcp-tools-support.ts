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
      : String(result.error)
  } catch (error) {
    text = String(error)
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
  if (
    def.type === "optional" ||
    def.type === "nullable" ||
    def.type === "default"
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
