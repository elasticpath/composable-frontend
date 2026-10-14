import { PURPOSE_ANALYTICS, PURPOSE_PERSONALIZATION } from "@epcc-sdk/visitor";
import type { Purpose } from "@epcc-sdk/visitor";
import { COOKIE_PREFIX_KEY } from "../cookie-constants";

export const CONSENT_COOKIE_NAME = `${COOKIE_PREFIX_KEY}_consent`;
export const CONSENT_COOKIE_LIFETIME_SECONDS = 365 * 24 * 60 * 60;
export const PURPOSES: Purpose[] = [PURPOSE_ANALYTICS, PURPOSE_PERSONALIZATION];
export const GRANT_ALL_CONSENT_COOKIE_VALUE = PURPOSES.join(",");
export const REJECTED_CONSENT_COOKIE_VALUE = "rejected";

export function consentCookieValueFor(purposes: Purpose[]): string {
  return purposes.length > 0
    ? purposes.join(",")
    : REJECTED_CONSENT_COOKIE_VALUE;
}
