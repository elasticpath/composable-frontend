import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createClient } from "@hey-api/openapi-ts"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
import path from "node:path"
import { nullableIntersection } from "../../specs/heyapi/nullable-intersection"

const here = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.join(here, "..")
const generated = path.join(here, ".generated-nullable-intersection")

const typeErrorsIn = (source: string) => {
  const file = path.join(generated, "check.ts")
  fs.writeFileSync(file, source)
  try {
    execFileSync(
      path.join(packageRoot, "node_modules/.bin/tsc"),
      ["--noEmit", "--strict", "--skipLibCheck", "--target", "es2020", file],
      { stdio: "pipe" },
    )
    return ""
  } catch (error) {
    return String((error as { stdout?: Buffer }).stdout)
  }
}

beforeAll(async () => {
  await createClient({
    input: path.join(here, "fixtures/nullable-intersection.yaml"),
    logs: { level: "silent" },
    output: { path: generated, postProcess: [] },
    plugins: [
      {
        $resolvers: { intersection: nullableIntersection },
        name: "@hey-api/typescript",
      },
    ],
  })
}, 60_000)

afterAll(() => {
  fs.rmSync(generated, { force: true, recursive: true })
})

describe("a nullable oneOf that also lists shared properties, typed with nullableIntersection", () => {
  it("accepts null, as its zod schema does", () => {
    expect(
      typeErrorsIn(`import type { Holder } from "./types.gen"
const cleared: Holder = { payment: null, payments: { first: null } }
export { cleared }
`),
    ).toBe("")
  })

  it("still accepts each member and rejects a value that is neither", () => {
    expect(
      typeErrorsIn(`import type { NullablePayment } from "./types.gen"
const card: NullablePayment = { type: "card", last4: "4242" }
const bank: NullablePayment = { type: "bank", iban: "GB00" }
// @ts-expect-error
const other: NullablePayment = { type: "cash" }
export { bank, card, other }
`),
    ).toBe("")
  })

  it("leaves a oneOf that is not nullable without null", () => {
    expect(
      typeErrorsIn(`import type { Holder } from "./types.gen"
// @ts-expect-error
const missing: Holder = { required_payment: null }
export { missing }
`),
    ).toBe("")
  })
})
