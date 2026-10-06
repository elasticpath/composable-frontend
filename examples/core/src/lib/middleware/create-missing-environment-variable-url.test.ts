import { describe, expect, test } from "vitest"
import {
  createMissingEnvironmentVariablePath,
  createMissingEnvironmentVariableUrl,
} from "./create-missing-environment-variable-url"

describe("createMissingEnvironmentVariablePath", () => {
  test("points at the localised configuration page and names the variable", () => {
    const url = new URL(
      createMissingEnvironmentVariablePath(
        "en",
        ["NEXT_PUBLIC_PASSWORD_PROFILE_ID"],
        "/login",
      ),
      "https://example.com",
    )

    expect(url.pathname).toBe("/en/configuration-error")
    expect(url.searchParams.getAll("missing-env-variable")).toEqual([
      "NEXT_PUBLIC_PASSWORD_PROFILE_ID",
    ])
    expect(url.searchParams.get("from")).toBe("/login")
  })

  test("names every variable that is missing", () => {
    const url = new URL(
      createMissingEnvironmentVariablePath("fr", ["A", "B"], "/"),
      "https://example.com",
    )

    expect(url.searchParams.getAll("missing-env-variable")).toEqual(["A", "B"])
  })
})

describe("createMissingEnvironmentVariableUrl", () => {
  test("builds the same query as the localised path", () => {
    const fromUrl = createMissingEnvironmentVariableUrl(
      ["A", "B"],
      "https://example.com/en/login",
      "/login",
    )
    const fromPath = new URL(
      createMissingEnvironmentVariablePath("en", ["A", "B"], "/login"),
      "https://example.com",
    )

    expect(fromUrl.pathname).toBe("/configuration-error")
    expect(fromUrl.searchParams.getAll("missing-env-variable")).toEqual(
      fromPath.searchParams.getAll("missing-env-variable"),
    )
    expect(fromUrl.searchParams.get("from")).toBe(
      fromPath.searchParams.get("from"),
    )
  })

  test("accepts a single variable name and omits the return path when none is given", () => {
    const url = createMissingEnvironmentVariableUrl("A", "https://example.com/")

    expect(url.searchParams.getAll("missing-env-variable")).toEqual(["A"])
    expect(url.searchParams.has("from")).toBe(false)
  })
})
