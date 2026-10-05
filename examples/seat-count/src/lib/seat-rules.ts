export const DEFAULT_SEAT_LIMIT = 20

const MINIMUM_SEATS = 1

const TOTAL_LOCALE = "en-US"

type CatalogPrice = {
  amount?: number
  currency?: string
  formatted?: string
}

export type SeatProduct = {
  attributes?: { shopper_attributes?: Record<string, string> }
  meta?: {
    display_price?: { without_tax?: CatalogPrice; with_tax?: CatalogPrice }
  }
}

export type SeatTotal = {
  amount: number
  currency: string
  formatted: string
}

export type SeatSelection = {
  limit: number
  seats: number
  overLimit: boolean
  accepted: boolean
  total: SeatTotal | null
}

export function seatLimit(product: SeatProduct): number {
  const raw = product.attributes?.shopper_attributes?.max_seats?.trim()
  if (!raw || !/^\d+$/.test(raw)) return DEFAULT_SEAT_LIMIT

  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) && parsed >= MINIMUM_SEATS
    ? parsed
    : DEFAULT_SEAT_LIMIT
}

export function selectSeats(
  product: SeatProduct,
  requested: unknown,
): SeatSelection {
  const limit = seatLimit(product)
  const count = requestedCount(requested)

  if (count === null) {
    return selection(product, limit, MINIMUM_SEATS, false, false)
  }

  if (count > limit) {
    return selection(product, limit, limit, true, false)
  }

  const seats = Math.max(MINIMUM_SEATS, Math.floor(count))
  return selection(product, limit, seats, false, seats === count)
}

function selection(
  product: SeatProduct,
  limit: number,
  seats: number,
  overLimit: boolean,
  accepted: boolean,
): SeatSelection {
  return { limit, seats, overLimit, accepted, total: totalFor(product, seats) }
}

function requestedCount(requested: unknown): number | null {
  const value =
    typeof requested === "string" && requested.trim() !== ""
      ? Number(requested)
      : requested

  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function totalFor(product: SeatProduct, seats: number): SeatTotal | null {
  const price =
    product.meta?.display_price?.without_tax ??
    product.meta?.display_price?.with_tax

  if (typeof price?.amount !== "number" || !price.currency) return null

  const format = new Intl.NumberFormat(TOTAL_LOCALE, {
    style: "currency",
    currency: price.currency,
  })
  const minorUnitsPerMajor =
    10 ** (format.resolvedOptions().maximumFractionDigits ?? 2)
  const amount = price.amount * seats

  return {
    amount,
    currency: price.currency,
    formatted: format.format(amount / minorUnitsPerMajor),
  }
}
