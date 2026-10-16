import { describe, expect, it } from "vitest"
import * as z from "zod"
import { loose, toToolResult } from "./client/mcp-support.gen"

const price = z.object({ amount: z.number() })
const withExtra = { amount: 1, unlisted: { nested: true } }

describe("loose", () => {
  it("keeps an unlisted key inside a record value object", () => {
    const schema = loose(z.object({ prices: z.record(z.string(), price) }))

    expect(schema.parse({ prices: { USD: withExtra } })).toEqual({
      prices: { USD: withExtra },
    })
  })

  it.each([
    ["readonly", price.readonly()],
    ["nonoptional", price.optional().nonoptional()],
    ["catch", price.catch({ amount: 0 })],
    ["prefault", price.prefault({ amount: 0 })],
    ["lazy", z.lazy(() => price)],
  ])("keeps an unlisted key inside a %s wrapper", (_name, schema) => {
    expect(loose(schema).parse(withExtra)).toEqual(withExtra)
  })

  it("keeps descriptions and checks", () => {
    const schema = loose(
      z.object({
        prices: z
          .record(
            z.string(),
            z.object({ name: z.string().min(2).describe("The price name") }),
          )
          .describe("Prices by currency"),
      }),
    )

    const json = z.toJSONSchema(schema) as any

    expect(json.properties.prices.description).toBe("Prices by currency")
    expect(
      json.properties.prices.additionalProperties.properties.name,
    ).toMatchObject({ description: "The price name", minLength: 2 })
    expect(() => schema.parse({ prices: { USD: { name: "x" } } })).toThrow()
  })
})

describe("toToolResult", () => {
  it("writes a plain-object rejection as JSON", async () => {
    const result = await toToolResult(Promise.reject({ code: "E_PLAIN" }))

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: '{"code":"E_PLAIN"}' }],
    })
  })

  it("writes a plain-object error without a response as JSON", async () => {
    const result = await toToolResult(
      Promise.resolve({ error: { code: "E_PLAIN" } }),
    )

    expect(result.content).toEqual([
      { type: "text", text: '{"code":"E_PLAIN"}' },
    ])
  })

  it("writes a thrown Error as its message", async () => {
    const result = await toToolResult(Promise.reject(new Error("went wrong")))

    expect(result.content).toEqual([{ type: "text", text: "went wrong" }])
  })
})
