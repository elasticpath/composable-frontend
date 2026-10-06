import { describeFailure } from "./cart-failure"
import {
  COULD_NOT_CONFIRM_MERGE_MESSAGE,
  NOTHING_MERGED_MESSAGE,
} from "./messages"
import { refusalsIn, type Refusal } from "./refusal"
import type { SharedLine } from "./shared-cart"

export type MergeFailure = { summary: string; problems: string[] }

const UNKNOWN_PRODUCT_NAME = "A shared product"

const PRODUCT_REFUSAL_STATUSES = [400, 404, 422]
const ACCOUNT_LEVEL_STATUSES = [403, 429]

function reasonFor({ status, title }: Refusal): string {
  if (title && /stock/i.test(title)) return "not enough stock"
  if (status === 404) return "no longer available"
  return "could not be added"
}

function namesAProduct({ status, title, productRef }: Refusal): boolean {
  if (status !== 400) return true
  return Boolean(productRef) || Boolean(title && /stock/i.test(title))
}

function allRefusedWith(
  refusals: readonly Refusal[],
  statuses: readonly number[],
): boolean {
  return (
    refusals.length > 0 &&
    refusals.every((refusal) => statuses.includes(refusal.status))
  )
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

  if (allRefusedWith(refusals, PRODUCT_REFUSAL_STATUSES)) {
    const names = nameProducts(lines)

    return {
      summary: NOTHING_MERGED_MESSAGE,
      problems: refusals
        .filter(namesAProduct)
        .map(
          (refusal) =>
            `${(refusal.productRef && names.get(refusal.productRef)) || UNKNOWN_PRODUCT_NAME}: ${reasonFor(refusal)}`,
        ),
    }
  }

  if (allRefusedWith(refusals, ACCOUNT_LEVEL_STATUSES)) {
    return { summary: describeFailure(error, "resume"), problems: [] }
  }

  return { summary: COULD_NOT_CONFIRM_MERGE_MESSAGE, problems: [] }
}
