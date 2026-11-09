import { hasBrowserGlobalPrivacyControl } from "@epcc-sdk/sdks-shopper"
import type { BrowserConsentFunction } from "@epcc-sdk/sdks-shopper"
import {
  ACCEPTED_ALL_VALUE,
  ALL_PURPOSES,
  REJECTED_VALUE,
  readConsentAnswer,
} from "./consent-cookie"

export const consent: BrowserConsentFunction = () => {
  const answer = readConsentAnswer()

  if (hasBrowserGlobalPrivacyControl() || answer === REJECTED_VALUE) {
    return { state: "objected" }
  }

  if (answer === ACCEPTED_ALL_VALUE) {
    return { state: "granted", purposes: ALL_PURPOSES }
  }

  return { state: "none" }
}
