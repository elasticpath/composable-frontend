import { describeFailure } from "./cart-failure"
import { CartsUnavailableError } from "./carts-port"
import {
  COULD_NOT_CONFIRM_MERGE_MESSAGE,
  NOTHING_MERGED_MESSAGE,
} from "./merge-failure-messages"
import type { SharedLine } from "./shared-cart"

export { COULD_NOT_CONFIRM_MERGE_MESSAGE, NOTHING_MERGED_MESSAGE }

export type MergeFailure = { summary: string; problems: string[] }

const UNKNOWN_PRODUCT_NAME = "A shared product"

const PRODUCT_REFUSAL_STATUSES = [400, 404, 422]
const ACCOUNT_LEVEL_STATUSES = [403, 429]

type Refusal = {
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

function refusalsIn(error: unknown): Refusal[] {
  if (!(error instanceof CartsUnavailableError)) return []

  const { cause } = error
  if (typeof cause !== "object" || cause === null) return []

  const { errors } = cause as { errors?: unknown }
  const items = Array.isArray(errors) ? errors : [cause]
  const refusals = items.map(toRefusal)

  return refusals.every((refusal) => refusal !== undefined)
    ? (refusals as Refusal[])
    : []
}

function reasonFor({ status, title }: Refusal): string {
  if (title && /stock/i.test(title)) return "not enough stock"
  if (status === 404) return "no longer available"
  return "could not be added"
}

function nameProducts(lines: readonly SharedLine[]): Map<string, string> {
  const names = new Map<string, string>()
  for (const line of lines) {
    names.set(line.id, line.name)
    if (line.productId) names.set(line.productId, line.name)
  }
  return names
}

export function describeMergeFailure({
  error,
  lines,
}: {
  error: unknown
  lines: readonly SharedLine[]
}): MergeFailure {
  const refusals = refusalsIn(error)
  const allIn = (statuses: number[]) =>
    refusals.length > 0 &&
    refusals.every((refusal) => statuses.includes(refusal.status))

  if (allIn(PRODUCT_REFUSAL_STATUSES)) {
    const names = nameProducts(lines)

    return {
      summary: NOTHING_MERGED_MESSAGE,
      problems: refusals.map(
        (refusal) =>
          `${(refusal.productRef && names.get(refusal.productRef)) || UNKNOWN_PRODUCT_NAME}: ${reasonFor(refusal)}`,
      ),
    }
  }

  if (allIn(ACCOUNT_LEVEL_STATUSES)) {
    return { summary: describeFailure(error, "resume"), problems: [] }
  }

  return { summary: COULD_NOT_CONFIRM_MERGE_MESSAGE, problems: [] }
}
