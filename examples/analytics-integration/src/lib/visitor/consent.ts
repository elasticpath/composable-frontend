import {
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
  readCookie,
} from "@epcc-sdk/visitor";
import type { ConsentFunction, Purpose } from "@epcc-sdk/visitor";
import { CONSENT_COOKIE_NAME } from "./consent-cookie";

const KNOWN_PURPOSES: Purpose[] = [PURPOSE_ANALYTICS, PURPOSE_PERSONALIZATION];

export const consent: ConsentFunction = (request) => {
  const listed = readCookie(request, CONSENT_COOKIE_NAME)?.split(",") ?? [];
  const purposes = KNOWN_PURPOSES.filter((purpose) => listed.includes(purpose));

  return purposes.length > 0
    ? { state: "granted", purposes }
    : { state: "none" };
};
