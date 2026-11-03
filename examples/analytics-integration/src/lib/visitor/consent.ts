import { hasGlobalPrivacyControl, readCookie } from "@epcc-sdk/sdks-shopper";
import type { ConsentFunction } from "@epcc-sdk/sdks-shopper";
import {
  CONSENT_COOKIE_NAME,
  PURPOSES,
  REJECTED_CONSENT_COOKIE_VALUE,
} from "./consent-cookie";
import { isSessionVisitorIdEnabled } from "./session-visitor-id";

export const consent: ConsentFunction = (request) => {
  const answer = readCookie(request, CONSENT_COOKIE_NAME);

  if (
    hasGlobalPrivacyControl(request) ||
    answer === REJECTED_CONSENT_COOKIE_VALUE
  ) {
    return { state: "objected" };
  }

  const listed = answer?.split(",") ?? [];
  const purposes = PURPOSES.filter((purpose) => listed.includes(purpose));

  if (purposes.length > 0) {
    return { state: "granted", purposes };
  }

  return isSessionVisitorIdEnabled()
    ? { state: "none", sessionId: true }
    : { state: "none" };
};
