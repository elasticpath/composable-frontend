import { PURPOSE_ANALYTICS, PURPOSE_PERSONALIZATION } from "@epcc-sdk/visitor";
import { COOKIE_PREFIX_KEY } from "../cookie-constants";

export const CONSENT_COOKIE_NAME = `${COOKIE_PREFIX_KEY}_consent`;
export const CONSENT_COOKIE_LIFETIME_SECONDS = 365 * 24 * 60 * 60;
export const GRANT_ALL_CONSENT_COOKIE_VALUE = [
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
].join(",");
