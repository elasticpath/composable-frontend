import { describe, expect, test, vi } from "vitest"
import { IdentityUnavailableError, resolveAccount } from "./account-session"

const ALICE = "11111111-1111-1111-1111-111111111111"
const BOB = "22222222-2222-2222-2222-222222222222"
const TOKEN = "an-account-management-authentication-token"

function deps(
  listAccounts: (options: unknown) => unknown,
  implicitToken = async () => "implicit-token",
) {
  return {
    implicitToken,
    listAccounts: listAccounts as never,
  }
}

const returning = (data: unknown) => async (_options: unknown) => ({
  data,
  error: undefined,
})

describe("resolveAccount", () => {
  test("no cookie means signed out, and asks Elastic Path nothing", async () => {
    const listAccounts = vi.fn()

    expect(
      await resolveAccount(undefined, ALICE, deps(listAccounts)),
    ).toBeNull()
    expect(listAccounts).not.toHaveBeenCalled()
  })

  test("returns the one account the token belongs to", async () => {
    const session = await resolveAccount(
      TOKEN,
      ALICE,
      deps(returning({ data: [{ id: ALICE, name: "Alice Ltd" }] })),
    )

    expect(session).toEqual({ accountId: ALICE, accountName: "Alice Ltd" })
  })

  test("sends the account token and an implicit bearer through a dedicated client", async () => {
    const listAccounts = vi.fn(
      returning({ data: [{ id: ALICE, name: "Alice Ltd" }] }),
    )

    await resolveAccount(TOKEN, ALICE, deps(listAccounts))

    const options = listAccounts.mock.calls[0]![0] as {
      client?: unknown
      headers: Record<string, string>
    }
    expect(options.headers["EP-Account-Management-Authentication-Token"]).toBe(
      TOKEN,
    )
    expect(options.headers.Authorization).toBe("Bearer implicit-token")
    expect(options.client).toBeDefined()
  })

  test("an Elastic Path rejection means signed out", async () => {
    const rejected = async () => ({
      data: undefined,
      error: { errors: [{ detail: "not valid" }] },
      response: { status: 401 },
    })

    expect(await resolveAccount(TOKEN, ALICE, deps(rejected))).toBeNull()
  })

  test("a server error from Elastic Path is an outage, not a sign-out", async () => {
    const serverError = async () => ({
      data: undefined,
      error: { errors: [{ status: "503" }] },
      response: { status: 503 },
    })

    await expect(
      resolveAccount(TOKEN, ALICE, deps(serverError)),
    ).rejects.toThrow(IdentityUnavailableError)
  })

  test("a member of two accounts gets the account the token was issued for", async () => {
    const two = returning({
      data: [
        { id: ALICE, name: "Alice Ltd" },
        { id: BOB, name: "Bob Ltd" },
      ],
    })

    expect(await resolveAccount(TOKEN, BOB, deps(two))).toEqual({
      accountId: BOB,
      accountName: "Bob Ltd",
    })
  })

  test("is signed out when the account the token was issued for is not among the member's accounts", async () => {
    const onlyAlice = returning({ data: [{ id: ALICE, name: "Alice" }] })

    expect(await resolveAccount(TOKEN, BOB, deps(onlyAlice))).toBeNull()
    expect(
      await resolveAccount(TOKEN, ALICE, deps(returning({ data: [] }))),
    ).toBeNull()
  })

  test("is signed out when no account id was kept with the token, and asks Elastic Path nothing", async () => {
    const listAccounts = vi.fn()

    expect(
      await resolveAccount(TOKEN, undefined, deps(listAccounts)),
    ).toBeNull()
    expect(listAccounts).not.toHaveBeenCalled()
  })

  test("an outage is not reported as signed out", async () => {
    const down = async (_options: unknown) => {
      throw new Error("ECONNRESET")
    }

    await expect(resolveAccount(TOKEN, ALICE, deps(down))).rejects.toThrow(
      IdentityUnavailableError,
    )
  })

  test("a failure to mint the implicit token is an outage, not a sign-out", async () => {
    const implicit = async () => {
      throw new Error("token endpoint down")
    }

    await expect(
      resolveAccount(TOKEN, ALICE, deps(returning({ data: [] }), implicit)),
    ).rejects.toThrow(IdentityUnavailableError)
  })
})
