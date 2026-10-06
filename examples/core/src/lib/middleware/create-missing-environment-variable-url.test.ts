import { describe, expect, test } from "vitest"
import { createMissingEnvironmentVariablePath } from "./create-missing-environment-variable-url"

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
