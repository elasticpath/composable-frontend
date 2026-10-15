import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js"
import type { core } from "zod"
import { ToolCallError } from "./errors"
import {
  buildTool,
  indexOperations,
  inputSchemaOf,
  wantsOutputSchema,
} from "./tool"
import type {
  EndpointOperation,
  EndpointToolsOptions,
  SdkCallOptions,
  SdkCallResult,
  ToolArguments,
  ToolCall,
  ToolHooks,
  ToolValidator,
} from "./types"

const escapePointerToken = (token: PropertyKey) =>
  String(token).replace(/~/g, "~0").replace(/\//g, "~1")

function pointerOf(issue: core.$ZodIssue): string {
  const path =
    issue.code === "unrecognized_keys"
      ? [...issue.path, issue.keys[0]!]
      : issue.path
  return `/${path.map(escapePointerToken).join("/")}`
}

export function validateToolArguments(
  operation: EndpointOperation,
  args: unknown,
): void {
  const parsed = inputSchemaOf(operation).safeParse(args)
  if (parsed.success) return
  const [issue] = parsed.error.issues
  const pointer = pointerOf(issue!)
  throw new ToolCallError(`Invalid input at ${pointer}: ${issue!.message}`, {
    reason: "invalid_input",
    pointer,
  })
}

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const asInputError = (error: unknown) =>
  error instanceof ToolCallError
    ? error
    : new ToolCallError(`Invalid input: ${messageOf(error)}`, {
        reason: "invalid_input",
        cause: error,
      })

const bodyText = (body: unknown) =>
  typeof body === "string" ? body : JSON.stringify(body)

function failureOf(error: unknown, response?: Response): ToolCallError {
  if (response) {
    return new ToolCallError(`HTTP ${response.status}: ${bodyText(error)}`, {
      reason: "http",
      status: response.status,
      body: error,
    })
  }
  return new ToolCallError(`Network error: ${messageOf(error)}`, {
    reason: "network",
    cause: error,
  })
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export function defaultFormatResult({
  data,
}: {
  data: unknown
}): CallToolResult {
  const structuredContent = isRecord(data) ? data : { data: data ?? null }
  return {
    structuredContent,
    content: [{ type: "text", text: JSON.stringify(structuredContent) }],
  }
}

export function defaultMapError({
  error,
}: {
  error: ToolCallError
}): CallToolResult {
  return { isError: true, content: [{ type: "text", text: error.message }] }
}

function headersWithoutAuthorization(headers: unknown) {
  if (!isRecord(headers)) return headers
  return Object.fromEntries(
    Object.entries(headers).filter(
      ([header]) => header.toLowerCase() !== "authorization",
    ),
  )
}

function sdkArguments(args: ToolArguments) {
  const { path, query, headers, body } = args
  return Object.fromEntries(
    Object.entries({
      path,
      query,
      headers: headersWithoutAuthorization(headers),
      body,
    }).filter(([, value]) => value !== undefined),
  )
}

async function validate(
  operation: EndpointOperation,
  args: unknown,
  override?: ToolValidator,
) {
  const defaults = (value: unknown) => validateToolArguments(operation, value)
  if (override) await override(args, { operation, validate: defaults })
  else defaults(args)
}

async function callOperation(
  call: ToolCall,
  client: unknown,
): Promise<{ data: unknown; response: Response } | ToolCallError> {
  let result: SdkCallResult
  try {
    const send = call.operation.bindings.fn as (
      options: SdkCallOptions,
    ) => Promise<SdkCallResult>
    result = await send({
      ...sdkArguments(call.args),
      client,
      throwOnError: false,
    })
  } catch (error) {
    return failureOf(error)
  }
  const { response } = result
  if (result.error !== undefined || !response) {
    return failureOf(result.error, response)
  }
  return { data: response.status === 204 ? null : result.data, response }
}

export interface EndpointTools {
  readonly names: ReadonlyArray<string>
  tool(name: string): Tool
  list(): Tool[]
  call(
    name: string,
    args: unknown,
    overrides?: { client?: unknown },
  ): Promise<CallToolResult>
}

export function createEndpointTools(
  operations: ReadonlyArray<EndpointOperation>,
  options: EndpointToolsOptions = {},
): EndpointTools {
  const byName = indexOperations(operations, options)
  const names = [...byName.keys()]
  const built = new Map<string, Tool>()
  const hooks: Required<ToolHooks> = {
    formatResult: options.hooks?.formatResult ?? defaultFormatResult,
    mapError: options.hooks?.mapError ?? defaultMapError,
  }

  const operationNamed = (name: string) => {
    const operation = byName.get(name)
    if (!operation) throw new Error(`There is no tool named ${name}`)
    return operation
  }

  const tool = (name: string) => {
    const cached = built.get(name)
    if (cached) return cached
    const fresh = buildTool(operationNamed(name), {
      outputSchema: wantsOutputSchema(name, options),
    })
    built.set(name, fresh)
    return fresh
  }

  return {
    names,
    tool,
    list: () => names.map(tool),
    async call(name, args, overrides = {}) {
      const operation = operationNamed(name)
      const given = args ?? {}
      const call: ToolCall = { name, operation, args: given as ToolArguments }
      try {
        await validate(operation, given, options.tools?.[name]?.validate)
      } catch (error) {
        return hooks.mapError({ ...call, error: asInputError(error) })
      }
      const client = "client" in overrides ? overrides.client : options.client
      const outcome = await callOperation(call, client)
      if (outcome instanceof ToolCallError) {
        return hooks.mapError({ ...call, error: outcome })
      }
      return hooks.formatResult({ ...call, ...outcome })
    },
  }
}
