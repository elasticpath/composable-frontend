import type {
  McpServer,
  RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js"
import type {
  CallToolResult,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js"
import type { z } from "zod"

export type EndpointTool = {
  name: string
  config: {
    title: string
    description: string
    inputSchema: z.ZodObject
    annotations: ToolAnnotations
    _meta: Record<string, unknown>
  }
  call: (options: any) => Promise<CallToolResult>
}

type SdkResult = { data?: unknown; error?: unknown; response?: Response }

export function registerTools(
  server: McpServer,
  tools: EndpointTool[],
  options?: { client?: unknown },
): RegisteredTool[] {
  return tools.map((tool) =>
    server.registerTool(tool.name, tool.config, (args) =>
      tool.call({ ...args, client: options?.client }),
    ),
  )
}

const failure = (text: string): CallToolResult => ({
  isError: true,
  content: [{ type: "text", text }],
})

const networkError = (error: unknown) =>
  failure(`Network error: ${error instanceof Error ? error.message : error}`)

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export async function callSdk(
  fn: (options: any) => Promise<SdkResult>,
  options?: object,
): Promise<CallToolResult> {
  let result: SdkResult
  try {
    result = await fn({ ...options, throwOnError: false })
  } catch (error) {
    return networkError(error)
  }
  const { data, error, response } = result
  if (error !== undefined) {
    if (!response) return networkError(error)
    return failure(`HTTP ${response.status}: ${JSON.stringify(error)}`)
  }
  const structuredContent = isObject(data) ? data : { data: data ?? null }
  return {
    structuredContent,
    content: [{ type: "text", text: JSON.stringify(structuredContent) }],
  }
}
