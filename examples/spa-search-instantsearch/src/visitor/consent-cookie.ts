import {
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
  VISITOR_COOKIE_LIFETIME_SECONDS,
} from "@epcc-sdk/sdks-shopper"
import type { Purpose } from "@epcc-sdk/sdks-shopper"

export const CONSENT_COOKIE_NAME = "spa_consent"
export const ALL_PURPOSES: Purpose[] = [
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
]
export const ACCEPTED_ALL_VALUE = ALL_PURPOSES.join(",")
export const REJECTED_VALUE = "rejected"

export function readConsentAnswer(): string | undefined {
  for (const pair of document.cookie.split(";")) {
    const separator = pair.indexOf("=")
    if (pair.slice(0, separator).trim() === CONSENT_COOKIE_NAME) {
      return pair.slice(separator + 1).trim()
    }
  }
  return undefined
}

export function writeConsentAnswer(value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${VISITOR_COOKIE_LIFETIME_SECONDS}; SameSite=Lax${secure}`
}
