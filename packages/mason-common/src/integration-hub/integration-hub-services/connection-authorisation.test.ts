import { describe, expect, it } from "vitest"
import { performConnectionConfigAuthorisation } from "./connection-authorisation"
import {
  InstanceConfigVariableStatus,
  RequiredConfigVariableDataType,
} from "../../codegen/gql/graphql"

describe("connection-authorisation", () => {
  it("performConnectionConfigAuthorisation given required connection should return correct result", async () => {
    expect(
      await performConnectionConfigAuthorisation({
        configVariables: {
          nodes: [
            {
              status: InstanceConfigVariableStatus.Pending,
              requiredConfigVariable: {
                key: "Test Config Variable",
                id: "123",
                dataType: RequiredConfigVariableDataType.Connection,
              },
              authorizeUrl: "https://test-connection-url/expect-success",
            },
          ],
        },
      } as any)
    ).toEqual({
      success: true,
      connectionsMade: [
        {
          name: "Test Config Variable",
          id: "123",
          success: true,
        },
      ],
    })
  })

  it("performConnectionConfigAuthorisation given required connection should handle failure correctly", async () => {
    expect(
      await performConnectionConfigAuthorisation({
        configVariables: {
          nodes: [
            {
              status: InstanceConfigVariableStatus.Pending,
              requiredConfigVariable: {
                key: "Test Config Variable",
                id: "123",
                dataType: RequiredConfigVariableDataType.Connection,
              },
              authorizeUrl: "https://test-connection-url/expect-failure",
            },
          ],
        },
      } as any)
    ).toEqual({
      success: false,
      error: new Error("One or more connections failed"),
      connectionsMade: [
        {
          name: "Test Config Variable",
          id: "123",
          success: false,
          error: new Error("Server response was not ok 500"),
        },
      ],
    })
  })

  it("performConnectionConfigAuthorisation given empty nodes should return correct result", async () => {
    expect(
      await performConnectionConfigAuthorisation({
        configVariables: {
          nodes: null,
        },
      } as any)
    ).toEqual({
      success: true,
      connectionsMade: [],
    })
  })
})
