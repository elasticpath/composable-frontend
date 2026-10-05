import { CartsUnavailableError } from "./carts-port"

export type Refusal = {
  status: number
  title: string | undefined
  productRef: string | undefined
}

function toRefusal(item: unknown): Refusal | undefined {
  if (typeof item !== "object" || item === null) return undefined

  const { status, title, meta } = item as {
    status?: unknown
    title?: unknown
    meta?: { id?: unknown }
  }
  const numeric = Number(status)
  if (!Number.isInteger(numeric)) return undefined

  return {
    status: numeric,
    title: typeof title === "string" ? title : undefined,
    productRef: typeof meta?.id === "string" ? meta.id : undefined,
  }
}

function itemsIn(error: unknown): unknown[] {
  if (!(error instanceof CartsUnavailableError)) return []

  const { cause } = error
  if (typeof cause !== "object" || cause === null) return []

  const { errors } = cause as { errors?: unknown }

  return Array.isArray(errors) ? errors : [cause]
}

export function firstRefusalIn(error: unknown): Refusal | undefined {
  return toRefusal(itemsIn(error)[0])
}

export function refusalsIn(error: unknown): Refusal[] {
  const refusals = itemsIn(error).map(toRefusal)

  return refusals.every((refusal) => refusal !== undefined)
    ? (refusals as Refusal[])
    : []
}
