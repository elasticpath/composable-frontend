import {
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
  VISITOR_COOKIE_LIFETIME_SECONDS,
} from "@epcc-sdk/sdks-shopper";
import type { Purpose } from "@epcc-sdk/sdks-shopper";
import { COOKIE_PREFIX_KEY } from "../cookie-constants";

export const CONSENT_COOKIE_NAME = `${COOKIE_PREFIX_KEY}_consent`;
export const CONSENT_COOKIE_LIFETIME_SECONDS = VISITOR_COOKIE_LIFETIME_SECONDS;
export const PURPOSES: Purpose[] = [PURPOSE_ANALYTICS, PURPOSE_PERSONALIZATION];
export const GRANT_ALL_CONSENT_COOKIE_VALUE = PURPOSES.join(",");
export const REJECTED_CONSENT_COOKIE_VALUE = "rejected";

export function consentCookieValueFor(purposes: Purpose[]): string {
  return purposes.length > 0
    ? purposes.join(",")
    : REJECTED_CONSENT_COOKIE_VALUE;
}
