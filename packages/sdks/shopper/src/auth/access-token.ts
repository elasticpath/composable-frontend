import type { CreateAnAccessTokenResponses } from "../client"

/** The 200 body of `POST /oauth/access_token`. Canonical declares it inline, so the
 * generated client carries no schema of this name. Derived, not hand-written. */
export type AccessTokenResponse = CreateAnAccessTokenResponses[200]
