import { describe, expect, test } from "vitest"
import {
  DEFAULT_SEAT_LIMIT,
  seatLimit,
  selectSeats,
  type SeatProduct,
} from "./seat-rules"

const unitPrice = { amount: 2200, currency: "USD", formatted: "$22.00" }

function product(maxSeats?: string): SeatProduct {
  return {
    attributes: {
      shopper_attributes:
        maxSeats === undefined ? { range: "Trail" } : { max_seats: maxSeats },
    },
    meta: { display_price: { without_tax: unitPrice } },
  }
}

describe("seatLimit", () => {
  test("falls back to 20 when the product has no max_seats", () => {
    expect(seatLimit(product())).toBe(20)
    expect(DEFAULT_SEAT_LIMIT).toBe(20)
  })

  test("falls back to 20 when the product has no shopper_attributes at all", () => {
    expect(seatLimit({})).toBe(20)
  })

  test("reads a valid max_seats, which the API returns as a string", () => {
    expect(seatLimit(product("5"))).toBe(5)
  })

  test("ignores surrounding whitespace in max_seats", () => {
    expect(seatLimit(product(" 50 "))).toBe(50)
  })

  test("falls back to 20 when max_seats is zero", () => {
    expect(seatLimit(product("0"))).toBe(20)
  })

  test("falls back to 20 when max_seats is negative", () => {
    expect(seatLimit(product("-5"))).toBe(20)
  })

  test("falls back to 20 when max_seats is a decimal", () => {
    expect(seatLimit(product("2.5"))).toBe(20)
  })

  test("falls back to 20 when max_seats is text", () => {
    expect(seatLimit(product("ten"))).toBe(20)
    expect(seatLimit(product(""))).toBe(20)
  })
})

describe("selectSeats", () => {
  test("shows 1 seat when asked for fewer than 1", () => {
    expect(selectSeats(product(), 0)).toMatchObject({
      seats: 1,
      overLimit: false,
      accepted: false,
    })
    expect(selectSeats(product(), -3).seats).toBe(1)
  })

  test("accepts a request at the limit", () => {
    expect(selectSeats(product("5"), 5)).toMatchObject({
      limit: 5,
      seats: 5,
      overLimit: false,
      accepted: true,
    })
  })

  test("accepts a request between 1 and the limit", () => {
    expect(selectSeats(product(), 12)).toMatchObject({
      seats: 12,
      overLimit: false,
      accepted: true,
    })
  })

  test("stops at the limit and flags a request above it", () => {
    expect(selectSeats(product("5"), 6)).toMatchObject({
      limit: 5,
      seats: 5,
      overLimit: true,
      accepted: false,
    })
  })

  test("keeps a valid count when the request is not a number", () => {
    for (const requested of ["abc", "", undefined, null, Number.NaN]) {
      expect(selectSeats(product(), requested)).toMatchObject({
        seats: 1,
        overLimit: false,
        accepted: false,
      })
    }
  })

  test("reads a count sent as a string, as a form posts it", () => {
    expect(selectSeats(product(), "7")).toMatchObject({
      seats: 7,
      accepted: true,
    })
    expect(selectSeats(product("5"), "25").overLimit).toBe(true)
  })

  test("rounds a fractional request down and does not accept it as sent", () => {
    expect(selectSeats(product(), 2.5)).toMatchObject({
      seats: 2,
      accepted: false,
    })
  })

  test("prices 1 seat at the display price", () => {
    expect(selectSeats(product(), 1).total).toEqual({
      amount: 2200,
      currency: "USD",
      formatted: "$22.00",
    })
  })

  test("prices the limit at the display price times the limit", () => {
    expect(selectSeats(product(), 20).total).toEqual({
      amount: 44000,
      currency: "USD",
      formatted: "$440.00",
    })
  })

  test("prices an over-limit request at the limit, the count it shows", () => {
    expect(selectSeats(product("5"), 30).total?.amount).toBe(11000)
  })

  test("uses the currency's own minor units", () => {
    const yen = {
      meta: {
        display_price: {
          without_tax: { amount: 500, currency: "JPY", formatted: "¥500" },
        },
      },
    }

    expect(selectSeats(yen, 3).total).toEqual({
      amount: 1500,
      currency: "JPY",
      formatted: "¥1,500",
    })
  })

  test("falls back to the tax-inclusive price when there is no price without tax", () => {
    expect(
      selectSeats({ meta: { display_price: { with_tax: unitPrice } } }, 2).total
        ?.amount,
    ).toBe(4400)
  })

  test("has no total when the product has no price", () => {
    expect(selectSeats({}, 3).total).toBeNull()
    expect(
      selectSeats(
        { meta: { display_price: { without_tax: { currency: "USD" } } } },
        3,
      ).total,
    ).toBeNull()
  })
})
