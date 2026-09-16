import { describe, expect, test } from "vitest"
import {
  REQUIRED_ENV,
  envRequirementProblems,
  missingEnvRequirements,
  unusableEnvRequirements,
} from "./store-requirements"

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

describe("unusableEnvRequirements", () => {
  test("accepts an absolute https endpoint", () => {
    expect(
      unusableEnvRequirements({
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "https://euwest.api.elasticpath.com",
      }),
    ).toEqual([])
  })

  test("rejects a bare hostname, the shape most .env.local files in this repo use", () => {
    const [problem] = unusableEnvRequirements({
      NEXT_PUBLIC_EPCC_ENDPOINT_URL: "euwest.api.elasticpath.com",
    })

    expect(problem.name).toBe("NEXT_PUBLIC_EPCC_ENDPOINT_URL")
    expect(problem.remedy).toContain("https://euwest.api.elasticpath.com")
  })

  test("rejects a non-http scheme", () => {
    expect(
      unusableEnvRequirements({
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "ftp://example.com",
      }),
    ).toHaveLength(1)
  })

  test("says nothing about an endpoint that is simply absent", () => {
    // That is missingEnvRequirements' job; reporting it twice helps nobody.
    expect(unusableEnvRequirements({})).toEqual([])
  })
})

describe("envRequirementProblems", () => {
  test("reports absent and unusable together", () => {
    const problems = envRequirementProblems({
      ...complete,
      NEXT_PUBLIC_EPCC_ENDPOINT_URL: "no-scheme.example.com",
      SESSION_SECRET: "",
    })

    expect(problems.map((p) => p.name).sort()).toEqual([
      "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
      "SESSION_SECRET",
    ])
  })
})
