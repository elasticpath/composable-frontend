import { describe, expect, test } from "vitest"
import { REQUIRED_ENV, missingEnvRequirements } from "./store-requirements"

const complete = Object.fromEntries(
  REQUIRED_ENV.map(({ name }) => [name, "set"]),
)

describe("missingEnvRequirements", () => {
  test("reports nothing when every variable is set", () => {
    expect(missingEnvRequirements(complete)).toEqual([])
  })

  test("names the variable that is missing", () => {
    const { EPCC_CLIENT_SECRET, ...rest } = complete

    expect(missingEnvRequirements(rest).map((r) => r.name)).toEqual([
      "EPCC_CLIENT_SECRET",
    ])
  })

  test("treats an empty or whitespace value as missing", () => {
    expect(
      missingEnvRequirements({ ...complete, SESSION_SECRET: "   " }).map(
        (r) => r.name,
      ),
    ).toEqual(["SESSION_SECRET"])
  })

  test("reports every missing variable at once", () => {
    expect(missingEnvRequirements({})).toHaveLength(REQUIRED_ENV.length)
  })

  test("every requirement tells the reader what to do", () => {
    for (const requirement of REQUIRED_ENV) {
      expect(requirement.remedy.length).toBeGreaterThan(0)
    }
  })
})
