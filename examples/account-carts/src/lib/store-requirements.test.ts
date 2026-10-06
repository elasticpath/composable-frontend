import { describe, expect, test } from "vitest"
import {
  REQUIRED_ENV,
  SERVER_KEY_ENV,
  envRequirementProblems,
  missingCustomApiRequirement,
  missingServerKeyRequirements,
} from "./store-requirements"

const complete = Object.fromEntries(
  REQUIRED_ENV.map(({ name }) => [name, "set"]),
)

describe("envRequirementProblems", () => {
  test("reports nothing when every variable is set and the endpoint is absolute", () => {
    expect(
      envRequirementProblems({
        ...complete,
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "https://euwest.api.elasticpath.com",
      }),
    ).toEqual([])
  })

  test("names the variable that is missing", () => {
    const { NEXT_PUBLIC_PASSWORD_PROFILE_ID, ...rest } = complete

    expect(
      envRequirementProblems({
        ...rest,
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "https://api.example.test",
      }).map((r) => r.name),
    ).toEqual(["NEXT_PUBLIC_PASSWORD_PROFILE_ID"])
  })

  test("treats an empty or whitespace value as missing", () => {
    expect(
      envRequirementProblems({
        ...complete,
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "https://api.example.test",
        NEXT_PUBLIC_PASSWORD_PROFILE_ID: "   ",
      }).map((r) => r.name),
    ).toEqual(["NEXT_PUBLIC_PASSWORD_PROFILE_ID"])
  })

  test("reports every missing variable at once, so an absent endpoint is caught before anything builds a URL from it", () => {
    expect(envRequirementProblems({}).map((r) => r.name)).toEqual(
      REQUIRED_ENV.map(({ name }) => name),
    )
  })

  test("every requirement tells the reader what to do", () => {
    for (const requirement of REQUIRED_ENV) {
      expect(requirement.remedy.length).toBeGreaterThan(0)
    }
  })

  test("accepts an absolute http endpoint", () => {
    expect(
      envRequirementProblems({
        ...complete,
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "http://localhost:8080",
      }),
    ).toEqual([])
  })

  test("rejects a bare hostname and suggests the https form", () => {
    const [problem] = envRequirementProblems({
      ...complete,
      NEXT_PUBLIC_EPCC_ENDPOINT_URL: "euwest.api.elasticpath.com",
    })

    expect(problem.name).toBe("NEXT_PUBLIC_EPCC_ENDPOINT_URL")
    expect(problem.remedy).toContain("https://euwest.api.elasticpath.com")
  })

  test("rejects a non-http scheme", () => {
    expect(
      envRequirementProblems({
        ...complete,
        NEXT_PUBLIC_EPCC_ENDPOINT_URL: "ftp://example.com",
      }),
    ).toHaveLength(1)
  })

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

describe("missingCustomApiRequirement", () => {
  test("names the Custom API by its slug and says to provision it", () => {
    const requirement = missingCustomApiRequirement("cart-shares")

    expect(requirement.name).toBe('Custom API "cart-shares"')
    expect(requirement.remedy).toContain("pnpm provision")
  })
})
