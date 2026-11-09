import {
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
  VISITOR_COOKIE_LIFETIME_SECONDS,
} from "@epcc-sdk/sdks-shopper"
import type { Purpose } from "@epcc-sdk/sdks-shopper"

export type ConsentAnswer = "accepted" | "rejected"

export const CONSENT_COOKIE_NAME = "spa_consent"
export const ALL_PURPOSES: Purpose[] = [
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
]

function isConsentAnswer(value: string | undefined): value is ConsentAnswer {
  return value === "accepted" || value === "rejected"
}

export function readConsentAnswer(): ConsentAnswer | undefined {
  for (const pair of document.cookie.split(";")) {
    const separator = pair.indexOf("=")
    if (separator === -1) continue
    if (pair.slice(0, separator).trim() === CONSENT_COOKIE_NAME) {
      const value = pair.slice(separator + 1).trim()
      return isConsentAnswer(value) ? value : undefined
    }
  }
  return undefined
}

export function writeConsentAnswer(answer: ConsentAnswer) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE_NAME}=${answer}; Path=/; Max-Age=${VISITOR_COOKIE_LIFETIME_SECONDS}; SameSite=Lax${secure}`
}
