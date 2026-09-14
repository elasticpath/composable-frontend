/**
 * What this example needs before it can run, and how a missing piece is
 * reported.
 *
 * The saved list *is* the example, so anything it depends on is required, not
 * an enrichment: a missing piece sends the reader to the configuration error
 * page naming what is missing, rather than rendering an empty panel.
 */

export type Requirement = {
  /** The environment variable or store object that is missing. */
  name: string
  /** What the reader has to do about it. */
  remedy: string
}

export const REQUIRED_ENV = [
  {
    name: "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
    remedy:
      "Set it to your store's API base URL, for example https://euwest.api.elasticpath.com",
  },
  {
    name: "NEXT_PUBLIC_EPCC_CLIENT_ID",
    remedy:
      "Set it to the client id of a store API key. This one reaches the browser, so it must have no secret.",
  },
  {
    name: "NEXT_PUBLIC_PASSWORD_PROFILE_ID",
    remedy:
      "Create a password profile on an authentication realm and set it to that profile's id.",
  },
  {
    name: "EPCC_CLIENT_ID",
    remedy:
      "Set it to the client id of the server-only API key used for saved list writes.",
  },
  {
    name: "EPCC_CLIENT_SECRET",
    remedy:
      "Set it to that key's secret. It is read only on the server and must never be given a NEXT_PUBLIC_ prefix.",
  },
  {
    name: "SESSION_SECRET",
    remedy:
      "Set it to a random string of at least 32 characters. It signs the session cookie that names the signed-in account.",
  },
] as const satisfies readonly Requirement[]

export function missingEnvRequirements(
  env: Record<string, string | undefined>,
): Requirement[] {
  return REQUIRED_ENV.filter(({ name }) => {
    const value = env[name]
    return typeof value !== "string" || value.trim().length === 0
  }).map(({ name, remedy }) => ({ name, remedy }))
}

export function missingCustomApiRequirement(slug: string): Requirement {
  return {
    name: `Custom API "${slug}"`,
    remedy:
      "Run `pnpm provision` with admin credentials in your shell to create the Custom API and its account_id and product_id fields.",
  }
}
