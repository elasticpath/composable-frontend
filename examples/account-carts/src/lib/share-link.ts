import { NO_EXPIRY_DATE, formatExpiryDate } from "./expiry-date"

export const SHARE_PATH_PREFIX = "/share/"

export function shareLinkPath(token: string): string {
  return `${SHARE_PATH_PREFIX}${token}`
}

export function shareLinkUrl(origin: string, token: string): string {
  return new URL(shareLinkPath(token), origin).toString()
}

export const UNKNOWN_SHARE_DATE = "Unknown date"

export function formatSharedDate(sharedAt: string): string {
  const formatted = formatExpiryDate(sharedAt)

  return formatted === NO_EXPIRY_DATE ? UNKNOWN_SHARE_DATE : formatted
}
