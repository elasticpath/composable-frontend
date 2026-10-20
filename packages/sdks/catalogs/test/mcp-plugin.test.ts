import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { $, createClient } from "@hey-api/openapi-ts"
import { Client } from "@modelcontextprotocol/client"
import { InMemoryTransport, McpServer } from "@modelcontextprotocol/server"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import path from "node:path"
import * as z from "zod"
import { mcpTools } from "../../specs/heyapi/mcp-tools"

const here = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.join(here, "..")
const fixture = path.join(here, "fixtures/mcp-tools.yaml")
const output = path.join(here, ".generated-mcp-fixture")
const dryRunOutput = path.join(here, ".generated-mcp-dry-run")

const generate = (
  directory: string,
  dryRun = false,
  input: unknown = fixture,
) =>
  createClient({
    dryRun,
    input: input as string,
    logs: { level: "silent" },
    output: { path: directory, postProcess: [] },
    plugins: [
      { name: "@hey-api/client-fetch" },
      { name: "@hey-api/typescript" },
      { name: "@hey-api/sdk" },
      { metadata: true, name: "zod" },
      mcpTools($, { api: "fixture" }),
    ],
  })

type GeneratedTool = {
  name: string
  config: {
    title: string
    description: string
    inputSchema: z.ZodType
    _meta: Record<string, { id: string }>
  }
  handler: (
    args: unknown,
    ctx: { mcpReq: { signal: AbortSignal } },
  ) => Promise<{ isError?: boolean; content: Array<{ text: string }> }>
}
let tools: GeneratedTool[]
let createFixtureClient: (config: object) => unknown
const toolNamed = (name: string) => tools.find((tool) => tool.name === name)!

const specWith = (operation: object, content = "multipart/form-data") => ({
  openapi: "3.1.0",
  info: { title: "Inline", version: "1.0.0" },
  paths: {
    "/widgets": {
      post: {
        operationId: "uploadWidget",
        summary: "Upload a widget",
        requestBody: {
          required: true,
          content: {
            [content]: {
              schema: {
                type: "object",
                properties: { file: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { "201": { description: "The widget." } },
        ...operation,
      },
    },
  },
})

function stubFetch() {
  const requests: Request[] = []
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(
      input instanceof Request && init === undefined
        ? input
        : new Request(input, init),
    )
    return new Response(JSON.stringify({ data: { id: "image-1" } }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  }
  return { requests, fetch }
}

async function call(
  name: string,
  args: object,
  signal = new AbortController().signal,
) {
  const stub = stubFetch()
  const client = createFixtureClient({
    baseUrl: "https://example.com",
    fetch: stub.fetch,
  })
  const tool = (await import(path.join(output, "mcp.gen.ts")))
    .tools({ client })
    .find((candidate: GeneratedTool) => candidate.name === name)
  const result = await tool.handler(args, { mcpReq: { signal } })
  return { result, requests: stub.requests }
}

async function connect(registered: GeneratedTool[]) {
  const server = new McpServer({ name: "fixture", version: "1.0.0" })
  for (const tool of registered) {
    server.registerTool(tool.name, tool.config as any, tool.handler as any)
  }
  const mcpClient = new Client({ name: "test-client", version: "1.0.0" })
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(serverSide), mcpClient.connect(clientSide)])
  return mcpClient
}

async function listedInputSchemas(registered: GeneratedTool[] = tools) {
  const { tools: listed } = await (await connect(registered)).listTools()
  return Object.fromEntries(
    listed.map((tool) => [tool.name, tool.inputSchema as any]),
  )
}

async function callThroughServer(name: string, args: object) {
  const stub = stubFetch()
  const client = createFixtureClient({
    baseUrl: "https://example.com",
    fetch: stub.fetch,
  })
  const generated = await import(path.join(output, "mcp.gen.ts"))
  const mcpClient = await connect(generated.tools({ client }))
  const result = await mcpClient.callTool({ name, arguments: args })
  return { result, requests: stub.requests }
}

const occurrences = (text: string, part: string) => text.split(part).length - 1

const refsIn = (schema: unknown) =>
  [...JSON.stringify(schema).matchAll(/"\$ref":"([^"]+)"/g)].map(
    (match) => match[1],
  )

const conditionField =
  "The cart field that the condition reads, such as the cart total"

const base64 = (text: string) => Buffer.from(text).toString("base64")

beforeAll(async () => {
  fs.rmSync(output, { force: true, recursive: true })
  await generate(output)
  const generated = await import(path.join(output, "mcp.gen.ts"))
  tools = generated.tools()
  createFixtureClient = (await import(path.join(output, "client/index.ts")))
    .createClient
}, 120_000)

afterAll(() => {
  for (const directory of [output, dryRunOutput]) {
    fs.rmSync(directory, { force: true, recursive: true })
  }
})

describe("the MCP tools plugin", () => {
  it("generates a tool for a multipart body and none for a form-encoded body", () => {
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "fixture_attach_widget_file",
      "fixture_check_widget_condition",
      "fixture_create_widget",
      "fixture_create_widget_rule",
      "fixture_delete_a_widget",
      "fixture_get_a_widget",
      "fixture_get_widget_history_attachment",
      "fixture_list_legacy_widgets",
      "fixture_list_old_widgets",
      "fixture_list_retired_widgets",
      "fixture_list_widgets",
      "fixture_replace_widget_rule",
      "fixture_update_a_widget",
      "fixture_upload_widget_image",
    ])
  })

  it("names a tool with x-mcp-name and keeps the SDK function in the operation id", () => {
    const tool = toolNamed("fixture_get_widget_history_attachment")

    expect(tool.config._meta["com.elasticpath/operation"]!.id).toBe(
      "fixture.getWidgetHistoryEntryRevisionAttachmentByIdentifiers",
    )
  })

  it.each([
    ["is over 64 characters", "fixture_" + "a".repeat(57)],
    ["has a space", "fixture widget"],
  ])("rejects an x-mcp-name that %s", async (_reason, name) => {
    const spec = specWith({ "x-mcp-name": name }, "application/json")

    await expect(generate(dryRunOutput, true, spec)).rejects.toMatchObject({
      originalError: {
        error: { message: `uploadWidget gives the invalid tool name ${name}` },
      },
    })
  })

  it("rejects a generated tool name over 64 characters and suggests x-mcp-name", async () => {
    const operationId = "uploadA" + "VeryLong".repeat(8) + "Widget"
    const spec = specWith({ operationId }, "application/json")

    await expect(generate(dryRunOutput, true, spec)).rejects.toMatchObject({
      originalError: {
        error: {
          message: expect.stringContaining("set x-mcp-name"),
        },
      },
    })
  })

  it("asks for a file field as a data: URI string", () => {
    const input = z.toJSONSchema(
      toolNamed("fixture_upload_widget_image").config.inputSchema,
    ) as any

    expect(input.properties.body.properties.file).toMatchObject({
      type: "string",
      format: "uri",
    })
    expect(input.properties.body.properties.file.description).toContain(
      "The image to upload.",
    )
    expect(input.properties.body.properties.file.description).toContain("data:")
    expect(input.properties.body.properties.file.description).toContain(
      "16 bytes",
    )
    expect(input.properties.body.required).toEqual(["file"])
  })

  it("marks a file field with x-mcp-file and its size limit", () => {
    const input = z.toJSONSchema(
      toolNamed("fixture_upload_widget_image").config.inputSchema,
    ) as any

    expect(input.properties.body.properties.file["x-mcp-file"]).toEqual({
      maxSize: 16,
    })
    expect(
      input.properties.body.properties.caption["x-mcp-file"],
    ).toBeUndefined()
  })

  it("asks for each file's name in a separate optional field", () => {
    const input = z.toJSONSchema(
      toolNamed("fixture_upload_widget_image").config.inputSchema,
    ) as any

    expect(input.properties.body.properties.file_name).toMatchObject({
      type: "string",
    })
    expect(input.properties.body.properties.file_name.description).toContain(
      "file",
    )
    expect(input.properties.body.required).toEqual(["file"])
  })

  it("names the file from its name field and sends no name field", async () => {
    const { requests } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: {
        file: `data:text/csv;base64,${base64("a,b")}`,
        file_name: "widgets.csv",
      },
    })

    const form = await requests[0]!.formData()
    expect((form.get("file") as File).name).toBe("widgets.csv")
    expect(form.has("file_name")).toBe(false)
  })

  it("prefers the name field over a name= parameter in the data: URI", async () => {
    const { requests } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: {
        file: `data:text/csv;name=old.csv;base64,${base64("a,b")}`,
        file_name: "new.csv",
      },
    })

    const file = (await requests[0]!.formData()).get("file") as File
    expect(file.name).toBe("new.csv")
  })

  it("rejects an upload whose body already has a field named for the file's name", async () => {
    const spec = specWith({ "x-mcp-max-file-bytes": 16 })
    ;(
      spec.paths["/widgets"].post.requestBody.content["multipart/form-data"]
        .schema.properties as Record<string, unknown>
    ).file_name = {
      type: "string",
    }

    await expect(generate(dryRunOutput, true, spec)).rejects.toMatchObject({
      originalError: {
        error: {
          message:
            "uploadWidget already has a file_name field, so the name of file has nowhere to go",
        },
      },
    })
  })

  it("uploads a base64 data: URI as a file part with its name and type", async () => {
    const { result, requests } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: {
        file: `data:text/csv;name=widgets.csv;base64,${base64("a,b\n1,2")}`,
        caption: "Widgets",
      },
    })

    expect(result.isError).toBeUndefined()
    expect(requests).toHaveLength(1)
    expect(requests[0]!.url).toBe("https://example.com/widgets/w1/image")
    expect(requests[0]!.headers.get("Content-Type")).toMatch(
      /^multipart\/form-data; boundary=/,
    )
    const form = await requests[0]!.formData()
    const file = form.get("file") as File
    expect(file.name).toBe("widgets.csv")
    expect(file.type).toBe("text/csv")
    expect(await file.text()).toBe("a,b\n1,2")
    expect(form.get("caption")).toBe("Widgets")
  })

  it("decodes a percent-encoded data: URI and names the file after its field", async () => {
    const { requests } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: { file: "data:,hello%20widgets" },
    })

    const file = (await requests[0]!.formData()).get("file") as File
    expect(file.name).toBe("file")
    expect(file.type).toBe("text/plain")
    expect(await file.text()).toBe("hello widgets")
  })

  it("reads the data: scheme in any case", async () => {
    const { result, requests } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: { file: `DATA:text/plain;BASE64,${base64("hi")}` },
    })

    expect(result.isError).toBeUndefined()
    const file = (await requests[0]!.formData()).get("file") as File
    expect(await file.text()).toBe("hi")
  })

  it("decodes a percent-encoded file name", async () => {
    const { requests } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: {
        file: `data:image/png;name=my%20widget.png;base64,${base64("png")}`,
      },
    })

    const file = (await requests[0]!.formData()).get("file") as File
    expect(file.name).toBe("my widget.png")
    expect(file.type).toBe("image/png")
  })

  it("accepts a file of exactly the size limit", async () => {
    const { result, requests } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: { file: `data:text/plain;base64,${base64("x".repeat(16))}` },
    })

    expect(result.isError).toBeUndefined()
    expect(requests).toHaveLength(1)
  })

  it.each([
    [
      "a file over the size limit",
      `data:text/plain;base64,${base64("x".repeat(17))}`,
      "17 bytes",
    ],
    ["a data: URI with no comma", "data:text/plain;base64", "data: URI"],
    ["invalid base64", "data:text/plain;base64,not base64!", "base64"],
    ["invalid percent-encoding", "data:text/plain,%E0%A4%A", "data: URI"],
    ["a URL to download", "https://example.com/widget.png", "data: URI"],
    ["text that is not a URI", "widget.png", "data: URI"],
  ])(
    "returns an error result and sends nothing for %s",
    async (_case, file, message) => {
      const { result, requests } = await call("fixture_upload_widget_image", {
        path: { id: "w1" },
        body: { file },
      })

      expect(result.isError).toBe(true)
      expect(result.content[0]!.text).toContain(message)
      expect(requests).toHaveLength(0)
    },
  )

  it("names the field and the limit when a file is too big", async () => {
    const { result } = await call("fixture_upload_widget_image", {
      path: { id: "w1" },
      body: { file: `data:text/plain;base64,${base64("x".repeat(17))}` },
    })

    expect(result.content[0]!.text).toBe(
      "file is 17 bytes, over the 16 bytes this tool accepts",
    )
  })

  it("sends a URL field as it is and no file part when the file is left out", async () => {
    const { result, requests } = await call("fixture_attach_widget_file", {
      path: { id: "w1" },
      body: { attachment_location: "https://example.com/manual.pdf" },
    })

    expect(result.isError).toBeUndefined()
    const form = await requests[0]!.formData()
    expect(form.get("attachment_location")).toBe(
      "https://example.com/manual.pdf",
    )
    expect(form.has("attachment")).toBe(false)
  })

  it("sends an optional multipart body that is left out", async () => {
    const { result, requests } = await call("fixture_attach_widget_file", {
      path: { id: "w1" },
    })

    expect(result.isError).toBeUndefined()
    expect(requests).toHaveLength(1)
  })

  it("rejects an operation that uploads a file and has no x-mcp-max-file-bytes", async () => {
    await expect(
      generate(dryRunOutput, true, specWith({})),
    ).rejects.toMatchObject({
      originalError: {
        error: {
          message: "uploadWidget uploads a file; set x-mcp-max-file-bytes",
        },
      },
    })
  })

  it.each([0, -1, 1.5, "8MB"])(
    "rejects an x-mcp-max-file-bytes of %s",
    async (limit) => {
      await expect(
        generate(
          dryRunOutput,
          true,
          specWith({ "x-mcp-max-file-bytes": limit }),
        ),
      ).rejects.toMatchObject({
        originalError: {
          error: {
            message: `uploadWidget needs a whole number of bytes above 0 in x-mcp-max-file-bytes`,
          },
        },
      })
    },
  )

  it("separates a one-letter word from the next word in a tool name", () => {
    expect(toolNamed("fixture_get_a_widget")).toBeDefined()
  })

  it("writes output that type-checks", () => {
    expect(() =>
      execFileSync(
        path.join(packageRoot, "node_modules/.bin/tsc"),
        [
          "--noEmit",
          "--strict",
          "--skipLibCheck",
          "--target",
          "es2020",
          "--module",
          "esnext",
          "--moduleResolution",
          "bundler",
          "--lib",
          "es2020,dom,dom.iterable",
          path.join(output, "mcp.gen.ts"),
        ],
        { stdio: "pipe" },
      ),
    ).not.toThrow()
  }, 60_000)

  it("describes a tool with the summary and the first paragraph of the description", () => {
    expect(toolNamed("fixture_get_a_widget").config.description).toBe(
      "Get a widget. Returns one widget by its ID.",
    )
  })

  it("describes a tool with the summary alone when the operation has no description", () => {
    expect(toolNamed("fixture_update_a_widget").config.description).toBe(
      "Update a widget",
    )
  })

  it("says it once when the first paragraph only repeats the summary", () => {
    expect(toolNamed("fixture_delete_a_widget").config.description).toBe(
      "Delete a widget.",
    )
  })

  it("titles a tool with the operation's summary", () => {
    expect(toolNamed("fixture_get_a_widget").config.title).toBe("Get a widget")
  })

  it("takes the title and description from x-mcp-title and x-mcp-description", () => {
    const { title, description } = toolNamed("fixture_create_widget").config

    expect(title).toBe("Make a widget")
    expect(description).toBe(
      "Makes one widget. Use it to add a widget to the list.",
    )
  })

  it("starts a deprecated operation's description with Deprecated", () => {
    expect(toolNamed("fixture_list_widgets").config.description).toBe(
      "Deprecated. List widgets. Lists every widget.",
    )
  })

  it("does not repeat Deprecated when the description already starts with it", () => {
    expect(toolNamed("fixture_list_legacy_widgets").config.description).toBe(
      "Deprecated. List legacy widgets. Use listWidgets instead.",
    )
  })

  it("starts an x-mcp-description with Deprecated when the operation is deprecated", () => {
    expect(toolNamed("fixture_list_old_widgets").config.description).toBe(
      "Deprecated. Lists widgets made before 2020.",
    )
  })

  it("leaves an x-mcp-description that already starts with Deprecated as written", () => {
    expect(toolNamed("fixture_list_retired_widgets").config.description).toBe(
      "Deprecated in favour of listing every widget.",
    )
  })

  it.each(["x-mcp-title", "x-mcp-description"])(
    "rejects a %s with no text",
    async (extension) => {
      const spec = {
        openapi: "3.1.0",
        info: { title: "Empty override", version: "1.0.0" },
        paths: {
          "/widgets": {
            get: {
              operationId: "listWidgets",
              summary: "List widgets",
              [extension]: " ",
              responses: { "200": { description: "The widgets." } },
            },
          },
        },
      }

      await expect(generate(dryRunOutput, true, spec)).rejects.toMatchObject({
        originalError: {
          error: { message: `listWidgets needs text in ${extension}` },
        },
      })
    },
  )

  it("imports the MCP SDK only from @modelcontextprotocol/server", () => {
    const specifiers = ["mcp.gen.ts", "mcp-support.gen.ts"].flatMap((file) =>
      [
        ...fs
          .readFileSync(path.join(output, file), "utf8")
          .matchAll(/from\s+"([^"]*modelcontextprotocol[^"]*)"/g),
      ].map((match) => match[1]),
    )

    expect(specifiers).not.toEqual([])
    expect(new Set(specifiers)).toEqual(
      new Set(["@modelcontextprotocol/server"]),
    )
  })

  it("aborts the request when the MCP request is cancelled", async () => {
    const controller = new AbortController()

    const { requests } = await call(
      "fixture_get_a_widget",
      { path: { id: "widget-1" } },
      controller.signal,
    )
    expect(requests[0]!.signal.aborted).toBe(false)
    controller.abort()

    expect(requests[0]!.signal.aborted).toBe(true)
  })

  it("leaves out the Authorization header and keeps the other headers", () => {
    const input = z.toJSONSchema(
      toolNamed("fixture_create_widget").config.inputSchema,
    ) as any

    expect(Object.keys(input.properties.headers.properties)).toEqual([
      "EP-Channel",
    ])
  })

  it("writes nothing and does not throw on a dry run", async () => {
    fs.rmSync(dryRunOutput, { force: true, recursive: true })

    await generate(dryRunOutput, true)

    expect(fs.existsSync(dryRunOutput)).toBe(false)
  })
})

describe("a schema that a tool's body uses in more than one place", () => {
  it("is listed once, as a definition that each place refers to, when it is large", async () => {
    const input = (await listedInputSchemas())["fixture_create_widget_rule"]
    const body = input.properties.body

    expect(refsIn(body.properties.when)).toEqual(["#/$defs/fixture_when"])
    expect(refsIn(body.properties.unless)).toEqual(["#/$defs/fixture_when"])
    expect(occurrences(JSON.stringify(input), conditionField)).toBe(1)
  })

  it("keeps its description in its definition", async () => {
    const input = (await listedInputSchemas())["fixture_create_widget_rule"]

    expect(input.$defs.fixture_when.description).toBe(
      "A test that a cart must pass for the widget rule to apply.",
    )
    expect(input.$defs.fixture_when.properties.field.description).toContain(
      conditionField,
    )
  })

  it("is written out in each place when it is small", async () => {
    const input = (await listedInputSchemas())["fixture_create_widget_rule"]
    const body = input.properties.body

    expect(body.properties.price).toMatchObject({
      description: "An amount of money.",
      properties: { amount: { type: "integer" } },
    })
    expect(body.properties.discount).toEqual(body.properties.price)
  })

  it("is listed once in each tool that uses it more than once, under an id no other tool has", async () => {
    const input = (await listedInputSchemas())["fixture_replace_widget_rule"]

    expect(refsIn(input.properties.body.properties.when)).toEqual([
      "#/$defs/fixture_when_2",
    ])
    expect(occurrences(JSON.stringify(input), conditionField)).toBe(1)
  })

  it("is written out in place in a tool that uses it once", async () => {
    const input = (await listedInputSchemas())["fixture_check_widget_condition"]

    expect(input.$defs).toBeUndefined()
    expect(input.properties.body.properties.condition.description).toBe(
      "A test that a cart must pass for the widget rule to apply.",
    )
  })

  it("leaves the SDK's own zod schemas without an id, so the ./zod export lists them as before", async () => {
    const zodSchemas = await import(path.join(output, "zod.gen.ts"))

    expect(z.globalRegistry.get(zodSchemas.zWidgetCondition)?.id).toBe(
      undefined,
    )
    expect(
      (z.toJSONSchema(zodSchemas.zWidgetRule) as any).properties.unless,
    ).toMatchObject({ properties: { field: { type: "string" } } })
  })

  it("keeps an unlisted key inside it when the tool is called through an MCP server", async () => {
    const body = {
      when: { field: "total", operator: "greater_than", unlisted: 1 },
      unless: { field: "currency", operator: "equals", unlisted: { a: 1 } },
    }

    const { result, requests } = await callThroughServer(
      "fixture_create_widget_rule",
      { body },
    )

    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toEqual(body)
  })

  it.each([
    ["an operator it does not list", { field: "total", operator: "near" }],
    ["no field", { operator: "equals" }],
    ["a field that is not text", { field: 1, operator: "equals" }],
  ])(
    "rejects a value of it with %s when called through an MCP server",
    async (_case, when) => {
      const { result, requests } = await callThroughServer(
        "fixture_create_widget_rule",
        { body: { unless: when, when: { field: "total", operator: "in" } } },
      )

      expect(result.isError).toBe(true)
      expect(requests).toHaveLength(0)
    },
  )

  it("lists and calls a body whose schema contains itself, keeping unlisted keys at every depth", async () => {
    const body = {
      when: { field: "total", operator: "equals" },
      parts: [
        {
          name: "a",
          unlisted: 1,
          parts: [{ name: "b", unlisted: 2, parts: [{ name: "c" }] }],
        },
      ],
    }

    const input = (await listedInputSchemas())["fixture_create_widget_rule"]
    const { result, requests } = await callThroughServer(
      "fixture_create_widget_rule",
      { body },
    )

    expect(input.properties.body.properties.parts.type).toBe("array")
    expect(result.isError).toBeFalsy()
    expect(await requests[0]!.json()).toEqual(body)
  })

  it("lists the tools of a second copy of the module in the same process, with no clash of ids", async () => {
    vi.resetModules()
    const secondCopy = await import(path.join(output, "mcp.gen.ts"))

    const first = (await listedInputSchemas())["fixture_create_widget_rule"]
    const second = (await listedInputSchemas(secondCopy.tools()))[
      "fixture_create_widget_rule"
    ]

    expect(refsIn(first.properties.body.properties.when)).toEqual([
      "#/$defs/fixture_when",
    ])
    expect(refsIn(second.properties.body.properties.when)[0]).toMatch(
      /^#\/\$defs\/fixture_when_\d+$/,
    )
    expect(occurrences(JSON.stringify(second), conditionField)).toBe(1)
  })

  it("lists the same schemas when tools() is called again", async () => {
    const generated = await import(path.join(output, "mcp.gen.ts"))

    expect(await listedInputSchemas(generated.tools())).toEqual(
      await listedInputSchemas(generated.tools()),
    )
  })
})
