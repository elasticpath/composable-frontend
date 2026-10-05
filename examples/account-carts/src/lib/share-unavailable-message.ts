export type ShareUnavailableReason =
  | "not-provisioned"
  | "no-server-key"
  | "unreachable"

const MESSAGES: Record<ShareUnavailableReason, string> = {
  "not-provisioned":
    "This store has no cart-shares Custom API yet. Run `pnpm provision` with admin credentials, then try again.",
  "no-server-key":
    "Sharing needs the server-only key. Set EPCC_CLIENT_ID and EPCC_CLIENT_SECRET, then restart.",
  unreachable: "Could not reach Elastic Path. Try again shortly.",
}

export function shareUnavailableMessage(
  reason: ShareUnavailableReason,
): string {
  return MESSAGES[reason]
}
