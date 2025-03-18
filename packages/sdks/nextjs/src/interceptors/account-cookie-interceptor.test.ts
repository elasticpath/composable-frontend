import { describe, it, expect } from "vitest"
import { parseAccountMemberCredentialsCookieStr } from "./account-cookie-interceptor"

describe("parseAccountMemberCredentialsCookieStr", () => {
  it("should successfully parse a valid credentials cookie string", () => {
    const validCredentials = {
      accounts: {
        "1": {
          account_id: "1",
          account_name: "Test Account",
          expires: "2025-03-15",
          token: "abcd1234",
          type: "account_management_authentication_token",
        },
      },
      selected: "1",
      accountMemberId: "member1",
    }

    const jsonString = JSON.stringify(validCredentials)
    const result = parseAccountMemberCredentialsCookieStr(jsonString)
    expect(result).toEqual(validCredentials)
  })

  it("should return undefined for an invalid JSON string", () => {
    const invalidJSON = "not a valid JSON"
    const result = parseAccountMemberCredentialsCookieStr(invalidJSON)
    expect(result).toBeUndefined()
  })

  it("should return undefined when required properties are missing", () => {
    // Missing the 'type' property in the account credential.
    const invalidCredentials = {
      accounts: {
        "1": {
          account_id: "1",
          account_name: "Test Account",
          expires: "2025-03-15",
          token: "abcd1234",
          // 'type' property is missing here
        },
      },
      selected: "1",
      accountMemberId: "member1",
    }

    const jsonString = JSON.stringify(invalidCredentials)
    const result = parseAccountMemberCredentialsCookieStr(jsonString)
    expect(result).toBeUndefined()
  })

  it("should return undefined when a property has the wrong type", () => {
    // accountMemberId should be a string but is provided as a number.
    const invalidCredentials = {
      accounts: {
        "1": {
          account_id: "1",
          account_name: "Test Account",
          expires: "2025-03-15",
          token: "abcd1234",
          type: "account_management_authentication_token",
        },
      },
      selected: "1",
      accountMemberId: 123, // wrong type: number instead of string
    }

    const jsonString = JSON.stringify(invalidCredentials)
    const result = parseAccountMemberCredentialsCookieStr(jsonString)
    expect(result).toBeUndefined()
  })

  it("should return undefined if accounts is not an object", () => {
    // accounts is expected to be an object but provided as a string.
    const invalidCredentials = {
      accounts: "not an object",
      selected: "1",
      accountMemberId: "member1",
    }

    const jsonString = JSON.stringify(invalidCredentials)
    const result = parseAccountMemberCredentialsCookieStr(jsonString)
    expect(result).toBeUndefined()
  })
})
