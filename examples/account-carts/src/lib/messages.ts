export const CART_GONE_MESSAGE =
  "That cart is no longer in your account. It may have expired or been deleted."

export const NOT_ANSWERING_MESSAGE = "Elastic Path did not answer. Try again."

export const ADD_REFUSED_MESSAGE =
  "Elastic Path would not add that product to your cart. Try again."

export const OUT_OF_STOCK_MESSAGE =
  "That product is out of stock, so it was not added to your cart."

export const NOTHING_MERGED_MESSAGE = "Nothing was added to your cart."

export const COULD_NOT_CONFIRM_MERGE_MESSAGE =
  "We could not confirm whether your cart changed. Check your cart before trying again."

export type ShareUnavailableReason =
  | "not-provisioned"
  | "no-server-key"
  | "unreachable"

const SHARE_UNAVAILABLE_MESSAGES: Record<ShareUnavailableReason, string> = {
  "not-provisioned":
    "This store has no cart-shares Custom API yet. Run `pnpm provision` with admin credentials, then try again.",
  "no-server-key":
    "Sharing needs the server-only key. Set EPCC_CLIENT_ID and EPCC_CLIENT_SECRET, then restart.",
  unreachable: "Could not reach Elastic Path. Try again shortly.",
}

export function shareUnavailableMessage(
  reason: ShareUnavailableReason,
): string {
  return SHARE_UNAVAILABLE_MESSAGES[reason]
}
