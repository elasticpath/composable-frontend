import { hasBrowserGlobalPrivacyControl } from "@epcc-sdk/sdks-shopper"
import type { BrowserConsentFunction } from "@epcc-sdk/sdks-shopper"
import { ALL_PURPOSES, readConsentAnswer } from "./consent-cookie"

export const consent: BrowserConsentFunction = () => {
  const answer = readConsentAnswer()

  if (hasBrowserGlobalPrivacyControl() || answer === "rejected") {
    return { state: "objected" }
  }

  if (answer === "accepted") {
    return { state: "granted", purposes: ALL_PURPOSES }
  }

  return { state: "none" }
}
