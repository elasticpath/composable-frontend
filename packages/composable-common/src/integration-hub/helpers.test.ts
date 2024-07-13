import { describe, expect, it } from "vitest"
import {
  handleCatchError,
  processAsIntegrationHubErrorResponse,
} from "./helpers"

describe("helpers", () => {
  it("processAsIntegrationHubErrorResponse given error result should return correct failure result", () => {
    expect(
      processAsIntegrationHubErrorResponse({
        error: {
          name: "test error name",
          message: "test error message",
          graphQLErrors: [],
        },
      } as any)
    ).toMatchObject({
      success: false,
      error: new Error(`test error name - test error message`),
    })
  })

  it("processAsIntegrationHubErrorResponse given missing error should return correct error result", () => {
    expect(
      processAsIntegrationHubErrorResponse({
        error: undefined,
      } as any)
    ).toEqual({
      success: false,
      error: new Error("No error information was provided."),
    })
  })

  it("handleCatchError given unknown error that is an instance of Error should return error", () => {
    const error = new Error("Test error")
    expect(handleCatchError(error)).toEqual(error)
  })

  it("handleCatchError given unknown error that is not an instance of Error should generic message", () => {
    expect(handleCatchError("not an error instance")).toEqual(
      new Error("Unknown error occurred")
    )
  })
})
