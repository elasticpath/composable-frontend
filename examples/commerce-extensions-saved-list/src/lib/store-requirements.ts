export type Requirement = {
  name: string
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
] as const satisfies readonly Requirement[]

export function missingEnvRequirements(
  env: Record<string, string | undefined>,
): Requirement[] {
  return REQUIRED_ENV.filter(({ name }) => {
    const value = env[name]
    return typeof value !== "string" || value.trim().length === 0
  }).map(({ name, remedy }) => ({ name, remedy }))
}

export function endpointProblem(
  endpointUrl: string | undefined,
): Requirement | null {
  const endpoint = endpointUrl?.trim()

  if (!endpoint) {
    return {
      name: "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
      remedy:
        "Set it to your store's API base URL, for example https://euwest.api.elasticpath.com.",
    }
  }

  if (!isAbsoluteHttpUrl(endpoint)) {
    return {
      name: "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
      remedy: `"${endpoint}" has no scheme. Use the absolute URL, for example https://${endpoint.replace(/^\/+/, "")}.`,
    }
  }

  return null
}

export function unusableEnvRequirements(
  env: Record<string, string | undefined>,
): Requirement[] {
  const endpoint = env.NEXT_PUBLIC_EPCC_ENDPOINT_URL?.trim()
  if (!endpoint) return []
  const problem = endpointProblem(endpoint)
  return problem ? [problem] : []
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export function envRequirementProblems(
  env: Record<string, string | undefined>,
): Requirement[] {
  return [...missingEnvRequirements(env), ...unusableEnvRequirements(env)]
}

export function missingCustomApiRequirement(slug: string): Requirement {
  return {
    name: `Custom API "${slug}"`,
    remedy:
      "Run `pnpm provision` with admin credentials in your shell to create the Custom API and its account_id and product_id fields.",
  }
}
