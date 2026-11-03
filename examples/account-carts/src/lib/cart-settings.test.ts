import { describe, expect, test, vi } from "vitest"
import { readCartExpiry } from "./cart-settings"

type Getter = NonNullable<Parameters<typeof readCartExpiry>[0]>["getSettings"]

const settings = (data: unknown) =>
  vi.fn(async () => ({
    data,
    error: undefined,
    response: { status: 200 },
  })) as unknown as NonNullable<Getter> & ReturnType<typeof vi.fn>

const serverToken = async () => "server-token"

describe("readCartExpiry", () => {
  test("reads cart_expiry_days with the server token as the bearer", async () => {
    const getSettings = settings({
      data: { type: "settings", cart_expiry_days: 30 },
    })

    const expiry = await readCartExpiry({ serverToken, getSettings })

    expect(expiry).toEqual({ status: "set", days: 30 })
    expect(getSettings.mock.calls[0]![0]).toMatchObject({
      headers: { Authorization: "Bearer server-token" },
    })
  })

  test("says the store has not set it when the settings carry no value", async () => {
    const getSettings = settings({ data: { type: "settings" } })

    expect(await readCartExpiry({ serverToken, getSettings })).toEqual({
      status: "not-set",
    })
  })

  test("says the store has not set it when the value is not a whole number of days", async () => {
    for (const value of [0, -3, 2.5, "7"]) {
      const getSettings = settings({
        data: { type: "settings", cart_expiry_days: value },
      })

      expect(await readCartExpiry({ serverToken, getSettings })).toEqual({
        status: "not-set",
      })
    }
  })

  test("an Elastic Path error is unreadable, not a missing setting", async () => {
    const getSettings = vi.fn(async () => ({
      data: undefined,
      error: { errors: [{ status: 401, title: "Unauthorized" }] },
      response: { status: 401 },
    })) as unknown as NonNullable<Getter>

    expect(await readCartExpiry({ serverToken, getSettings })).toEqual({
      status: "unreadable",
    })
  })

  test("a network failure is unreadable, not a missing setting", async () => {
    const getSettings = vi.fn(async () => {
      throw new TypeError("fetch failed")
    }) as unknown as NonNullable<Getter>

    expect(await readCartExpiry({ serverToken, getSettings })).toEqual({
      status: "unreadable",
    })
  })

  test("a server key that cannot get a token is unreadable and sends nothing", async () => {
    const getSettings = settings({ data: { cart_expiry_days: 7 } })

    const expiry = await readCartExpiry({
      serverToken: async () => {
        throw new Error("Failed to get a server token")
      },
      getSettings,
    })

    expect(expiry).toEqual({ status: "unreadable" })
    expect(getSettings).not.toHaveBeenCalled()
  })
})
