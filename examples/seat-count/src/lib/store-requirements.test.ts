import { describe, expect, test } from "vitest"
import {
  REQUIRED_ENV,
  endpointProblem,
  envRequirementProblems,
} from "./store-requirements"

const complete = {
  NEXT_PUBLIC_EPCC_ENDPOINT_URL: "https://euwest.api.elasticpath.com",
  NEXT_PUBLIC_EPCC_CLIENT_ID: "client-id",
  CUSTOMER_SERVICE_URL: "mailto:sales@example.com",
}

describe("envRequirementProblems", () => {
  test("reports nothing when every variable is set and usable", () => {
    expect(envRequirementProblems(complete)).toEqual([])
  })

  test("covers every variable the example reads", () => {
    expect(REQUIRED_ENV.map(({ name }) => name).sort()).toEqual(
      Object.keys(complete).sort(),
    )
  })

  test("names each missing variable", () => {
    for (const name of Object.keys(complete)) {
      const env: Record<string, string | undefined> = { ...complete }
      delete env[name]

      expect(envRequirementProblems(env).map((p) => p.name)).toEqual([name])
    }
  })

  test("treats an empty or whitespace value as missing", () => {
    expect(
      envRequirementProblems({ ...complete, NEXT_PUBLIC_EPCC_CLIENT_ID: "  " }),
    ).toHaveLength(1)
  })

  test("reports every missing variable at once", () => {
    expect(envRequirementProblems({})).toHaveLength(REQUIRED_ENV.length)
  })

  test("every requirement tells the reader what to do", () => {
    for (const requirement of envRequirementProblems({})) {
      expect(requirement.remedy.length).toBeGreaterThan(0)
    }
  })

  test("rejects an endpoint with no scheme and suggests the absolute URL", () => {
    const [problem] = envRequirementProblems({
      ...complete,
      NEXT_PUBLIC_EPCC_ENDPOINT_URL: "euwest.api.elasticpath.com",
    })

    expect(problem.name).toBe("NEXT_PUBLIC_EPCC_ENDPOINT_URL")
    expect(problem.remedy).toContain("https://euwest.api.elasticpath.com")
  })

  test("accepts an http, https or mailto contact address", () => {
    for (const address of [
      "https://example.com/contact",
      "http://localhost:3000/contact",
      "mailto:sales@example.com",
    ]) {
      expect(
        envRequirementProblems({ ...complete, CUSTOMER_SERVICE_URL: address }),
      ).toEqual([])
    }
  })

  test("rejects a contact address the link could not open", () => {
    for (const address of [
      "sales@example.com",
      "/contact",
      "javascript:alert(1)",
    ]) {
      expect(
        envRequirementProblems({
          ...complete,
          CUSTOMER_SERVICE_URL: address,
        }).map((p) => p.name),
      ).toEqual(["CUSTOMER_SERVICE_URL"])
    }
  })
})

describe("endpointProblem", () => {
  test("reports an absent endpoint, which middleware checks before it builds a URL", () => {
    expect(endpointProblem(undefined)?.name).toBe(
      "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
    )
    expect(endpointProblem(" ")?.name).toBe("NEXT_PUBLIC_EPCC_ENDPOINT_URL")
  })

  test("accepts an absolute http or https URL", () => {
    expect(endpointProblem("https://euwest.api.elasticpath.com")).toBeNull()
    expect(endpointProblem("http://localhost:8080")).toBeNull()
  })

  test("rejects a non-http scheme", () => {
    expect(endpointProblem("ftp://example.com")).not.toBeNull()
  })
})
