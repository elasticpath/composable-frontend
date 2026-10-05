import { describe, expect, test } from "vitest"
import {
  REQUIRED_ENV,
  SERVER_KEY_ENV,
  endpointProblem,
  envRequirementProblems,
  missingEnvRequirements,
  missingServerKeyRequirements,
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
    const { NEXT_PUBLIC_PASSWORD_PROFILE_ID, ...rest } = complete

    expect(missingEnvRequirements(rest).map((r) => r.name)).toEqual([
      "NEXT_PUBLIC_PASSWORD_PROFILE_ID",
    ])
  })

  test("treats an empty or whitespace value as missing", () => {
    expect(
      missingEnvRequirements({
        ...complete,
        NEXT_PUBLIC_PASSWORD_PROFILE_ID: "   ",
      }).map((r) => r.name),
    ).toEqual(["NEXT_PUBLIC_PASSWORD_PROFILE_ID"])
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

  test("rejects a bare hostname and suggests the https form", () => {
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
    expect(unusableEnvRequirements({})).toEqual([])
  })
})

describe("envRequirementProblems", () => {
  test("reports absent and unusable together", () => {
    const problems = envRequirementProblems({
      ...complete,
      NEXT_PUBLIC_EPCC_ENDPOINT_URL: "no-scheme.example.com",
      NEXT_PUBLIC_PASSWORD_PROFILE_ID: "",
    })

    expect(problems.map((p) => p.name).sort()).toEqual([
      "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
      "NEXT_PUBLIC_PASSWORD_PROFILE_ID",
    ])
  })
})

describe("endpointProblem", () => {
  test("reports an absent endpoint, which middleware must catch before it builds a URL", () => {
    expect(endpointProblem(undefined)?.name).toBe(
      "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
    )
    expect(endpointProblem("")?.name).toBe("NEXT_PUBLIC_EPCC_ENDPOINT_URL")
    expect(endpointProblem("   ")?.name).toBe("NEXT_PUBLIC_EPCC_ENDPOINT_URL")
  })

  test("accepts an absolute http or https URL", () => {
    expect(endpointProblem("https://euwest.api.elasticpath.com")).toBeNull()
    expect(endpointProblem("http://localhost:8080")).toBeNull()
  })
})

describe("missingServerKeyRequirements", () => {
  const withKey = Object.fromEntries(
    SERVER_KEY_ENV.map(({ name }) => [name, "set"]),
  )

  test("reports nothing when the key's id and secret are set", () => {
    expect(missingServerKeyRequirements(withKey)).toEqual([])
  })

  test("names both variables when neither is set", () => {
    expect(missingServerKeyRequirements({}).map((r) => r.name)).toEqual([
      "EPCC_CLIENT_ID",
      "EPCC_CLIENT_SECRET",
    ])
  })

  test("names the secret when only the id is set", () => {
    expect(
      missingServerKeyRequirements({ EPCC_CLIENT_ID: "id" }).map((r) => r.name),
    ).toEqual(["EPCC_CLIENT_SECRET"])
  })

  test("treats an empty or whitespace value as missing", () => {
    expect(
      missingServerKeyRequirements({
        EPCC_CLIENT_ID: "id",
        EPCC_CLIENT_SECRET: "  ",
      }).map((r) => r.name),
    ).toEqual(["EPCC_CLIENT_SECRET"])
  })

  test("no variable of the server key has a NEXT_PUBLIC_ prefix", () => {
    for (const { name } of SERVER_KEY_ENV) {
      expect(name.startsWith("NEXT_PUBLIC_")).toBe(false)
    }
  })

  test("a missing server key does not stop the pages that only need shopper tokens", () => {
    expect(
      envRequirementProblems({
        ...complete,
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "https://api.example.test",
      }),
    ).toEqual([])
  })

  test("every requirement tells the reader what to do", () => {
    for (const requirement of SERVER_KEY_ENV) {
      expect(requirement.remedy.length).toBeGreaterThan(0)
    }
  })
})
