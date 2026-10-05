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
  const overLimit = count !== null && count > limit
  const seats =
    count === null
      ? MINIMUM_SEATS
      : Math.min(limit, Math.max(MINIMUM_SEATS, Math.floor(count)))

  return {
    limit,
    seats,
    overLimit,
    accepted: seats === count,
    total: totalFor(product, seats),
  }
}

export function fitsWithSeatsInCart(
  selection: SeatSelection,
  seatsAlreadyInCart: number,
): boolean {
  return seatsAlreadyInCart + selection.seats <= selection.limit
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
