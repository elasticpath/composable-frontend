import { describe, expect, test, vi } from "vitest"
import { signInWithPassword } from "./sign-in"

const credentials = {
  email: "Shopper@Example.com",
  password: "correct horse",
  passwordProfileId: "profile-1",
}

function deps(
  requestToken: (options: unknown) => unknown,
  implicitToken = async () => "implicit-token",
) {
  return { implicitToken, requestToken: requestToken as never }
}

const accepted = (data: unknown) => async (_options: unknown) => ({
  data,
  error: undefined,
  response: { status: 201 },
})

const refused = (status: number) => async (_options: unknown) => ({
  data: undefined,
  error: { errors: [{ status: String(status), title: "refused" }] },
  response: { status },
})

describe("signInWithPassword", () => {
  test("returns the account token and when it expires", async () => {
    const result = await signInWithPassword(
      credentials,
      deps(
        accepted({
          data: [
            {
              token: "account-token",
              expires: "2026-10-06T09:00:00Z",
              account_id: "account-1",
            },
          ],
        }),
      ),
    )

    expect(result).toEqual({
      ok: true,
      token: "account-token",
      accountId: "account-1",
      expires: new Date("2026-10-06T09:00:00Z"),
    })
  })

  test("asks for a password token with the lower-cased email and the profile id", async () => {
    const requestToken = vi.fn(
      accepted({
        data: [
          { token: "t", expires: "2026-10-06T09:00:00Z", account_id: "a" },
        ],
      }),
    )

    await signInWithPassword(credentials, deps(requestToken))

    const options = requestToken.mock.calls[0]![0] as {
      body: { data: Record<string, string> }
      headers: Record<string, string>
    }
    expect(options.body.data).toEqual({
      type: "account_management_authentication_token",
      authentication_mechanism: "password",
      password_profile_id: "profile-1",
      username: "shopper@example.com",
      password: "correct horse",
    })
    expect(options.headers.Authorization).toBe("Bearer implicit-token")
  })

  test("a rejected password is rejected, not unavailable", async () => {
    expect(await signInWithPassword(credentials, deps(refused(401)))).toEqual({
      ok: false,
      reason: "rejected",
    })
    expect(await signInWithPassword(credentials, deps(refused(422)))).toEqual({
      ok: false,
      reason: "rejected",
    })
  })

  test("a server error is unavailable, not a wrong password", async () => {
    expect(await signInWithPassword(credentials, deps(refused(503)))).toEqual({
      ok: false,
      reason: "unavailable",
    })
  })

  test("a network failure is unavailable, not a wrong password", async () => {
    const down = async (_options: unknown) => {
      throw new TypeError("fetch failed")
    }

    expect(await signInWithPassword(credentials, deps(down))).toEqual({
      ok: false,
      reason: "unavailable",
    })
  })

  test("a failure to mint the implicit token is unavailable", async () => {
    const implicit = async () => {
      throw new Error("token endpoint down")
    }

    expect(
      await signInWithPassword(
        credentials,
        deps(accepted({ data: [] }), implicit),
      ),
    ).toEqual({ ok: false, reason: "unavailable" })
  })

  test("an answer with no token is rejected, even without an error", async () => {
    expect(
      await signInWithPassword(credentials, deps(accepted({ data: [] }))),
    ).toEqual({ ok: false, reason: "rejected" })
    expect(
      await signInWithPassword(
        credentials,
        deps(accepted({ data: [{ token: "t" }] })),
      ),
    ).toEqual({ ok: false, reason: "rejected" })
  })

  test("a token issued for no account is reported as having no account, not as a wrong password", async () => {
    expect(
      await signInWithPassword(
        credentials,
        deps(
          accepted({
            data: [{ token: "t", expires: "2026-10-06T09:00:00Z" }],
          }),
        ),
      ),
    ).toEqual({ ok: false, reason: "no-account" })
  })
})
