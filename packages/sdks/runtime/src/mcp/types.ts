import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import type { ZodType } from "zod"
import type { ToolCallError } from "./errors"

export type RiskTier = "read" | "create" | "update" | "delete"

export type InputSection = "path" | "query" | "headers" | "body"

export interface PagingParameters {
  limit?: string
  offset?: string
}

export interface OperationFacts {
  id: string
  method: string
  path: string
  title: string
  description: string
  risk: RiskTier
  idempotent: boolean
  paging: PagingParameters | null
  deprecated: boolean
  agentUnsafe: boolean
  requiredSections: ReadonlyArray<InputSection>
}

export interface SdkCallOptions {
  client?: unknown
  path?: unknown
  query?: unknown
  headers?: unknown
  body?: unknown
  throwOnError: false
}

export interface SdkCallResult {
  data?: unknown
  error?: unknown
  response?: Response
}

export type SdkFunction = (options: never) => Promise<unknown>

export interface OperationBindings {
  fn: SdkFunction
  path?: ZodType
  query?: ZodType
  headers?: ZodType
  body?: ZodType
  response?: ZodType
}

export interface EndpointOperation {
  facts: OperationFacts
  bindings: OperationBindings
}

export type ToolArguments = Partial<Record<InputSection, unknown>>

export interface ToolCall {
  name: string
  operation: EndpointOperation
  args: ToolArguments
}

export interface ToolValidatorContext {
  operation: EndpointOperation
  validate: (args: unknown) => void
}

export type ToolValidator = (
  args: unknown,
  context: ToolValidatorContext,
) => void | Promise<void>

export interface ToolHooks {
  formatResult?: (
    call: ToolCall & { data: unknown; response: Response },
  ) => CallToolResult | Promise<CallToolResult>
  mapError?: (
    call: ToolCall & { error: ToolCallError },
  ) => CallToolResult | Promise<CallToolResult>
}

export interface ToolOptions {
  outputSchema?: boolean
  validate?: ToolValidator
}

export interface BuildToolsOptions {
  outputSchema?: boolean
  tools?: Readonly<Record<string, ToolOptions>>
}

export interface EndpointToolsOptions extends BuildToolsOptions {
  client?: unknown
  hooks?: ToolHooks
}
