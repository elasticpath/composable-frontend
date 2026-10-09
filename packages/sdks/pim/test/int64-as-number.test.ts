import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createClient } from "@hey-api/openapi-ts"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import path from "node:path"
import { int64AsNumber } from "../../specs/heyapi/int64-as-number"

const here = path.dirname(fileURLToPath(import.meta.url))
const generatedFromTheFixture = path.join(here, ".generated-int64-response")

type GeneratedSchema = {
  parse: (value: unknown) => unknown
  safeParse: (value: unknown) => { success: boolean }
}

let zCounts: GeneratedSchema
let zPaging: GeneratedSchema

beforeAll(async () => {
  await createClient({
    input: path.join(here, "fixtures/int64-response.yaml"),
    output: { path: generatedFromTheFixture },
    plugins: [
      {
        $resolvers: { number: int64AsNumber },
        compatibilityVersion: 3,
        name: "zod",
      },
    ],
  })
  ;({ zCounts, zPaging } = await import(
    /* @vite-ignore */ path.join(generatedFromTheFixture, "zod.gen.ts")
  ))
}, 60_000)

afterAll(() => {
  fs.rmSync(generatedFromTheFixture, { force: true, recursive: true })
})

describe("an int64 response field generated with int64AsNumber", () => {
  it("parses a required int64 field to a number", () => {
    expect(zCounts.parse({ total: 5, previous_total: 3 })).toEqual({
      total: 5,
      previous_total: 3,
    })
  })

  it("accepts null on a nullable int64 field", () => {
    expect(zCounts.parse({ total: 5, previous_total: null })).toEqual({
      total: 5,
      previous_total: null,
    })
  })

  it("rejects null on a required int64 field", () => {
    expect(zCounts.safeParse({ total: null, previous_total: 3 }).success).toBe(
      false,
    )
  })

  it("parses a numeric string to a number", () => {
    expect(zCounts.parse({ total: "20", previous_total: null })).toEqual({
      total: 20,
      previous_total: null,
    })
  })

  it("rejects a boolean", () => {
    expect(
      zCounts.safeParse({ total: true, previous_total: null }).success,
    ).toBe(false)
  })
})

describe("an int64 field with a default generated with int64AsNumber", () => {
  it("fills in the default as a number", () => {
    expect(zPaging.parse({})).toEqual({ page_size: 25 })
  })

  it("keeps a given value and its declared bounds", () => {
    expect(zPaging.parse({ page_size: "50" })).toEqual({ page_size: 50 })
    expect(zPaging.safeParse({ page_size: 101 }).success).toBe(false)
  })
})
