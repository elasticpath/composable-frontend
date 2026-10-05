export type Requirement = {
  name: string
  remedy: string
}

export const REQUIRED_ENV = [
  {
    name: "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
    remedy:
      "Set it to your store's API base URL, for example https://euwest.api.elasticpath.com.",
  },
  {
    name: "NEXT_PUBLIC_EPCC_CLIENT_ID",
    remedy:
      "Set it to the client id of a store API key. The example only requests an implicit (shopper) token with it, so the key's secret is never used.",
  },
  {
    name: "CUSTOMER_SERVICE_URL",
    remedy:
      "Set it to where shoppers go for orders above a product's seat limit: an absolute http(s) URL or a mailto: address.",
  },
] as const satisfies readonly Requirement[]

const CONTACT_PROTOCOLS = ["http:", "https:", "mailto:"]

const ENDPOINT_PROTOCOLS = ["http:", "https:"]

export function endpointProblem(
  endpointUrl: string | undefined,
): Requirement | null {
  const endpoint = endpointUrl?.trim()

  if (!endpoint) return requirementNamed("NEXT_PUBLIC_EPCC_ENDPOINT_URL")

  if (!hasProtocol(endpoint, ENDPOINT_PROTOCOLS)) {
    return {
      name: "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
      remedy: `"${endpoint}" has no scheme. Use the absolute URL, for example https://${endpoint.replace(/^\/+/, "")}.`,
    }
  }

  return null
}

export function envRequirementProblems(
  env: Record<string, string | undefined>,
): Requirement[] {
  const problems: Requirement[] = []

  const endpoint = endpointProblem(env.NEXT_PUBLIC_EPCC_ENDPOINT_URL)
  if (endpoint) problems.push(endpoint)

  if (!env.NEXT_PUBLIC_EPCC_CLIENT_ID?.trim()) {
    problems.push(requirementNamed("NEXT_PUBLIC_EPCC_CLIENT_ID"))
  }

  const contact = env.CUSTOMER_SERVICE_URL?.trim()
  if (!contact) {
    problems.push(requirementNamed("CUSTOMER_SERVICE_URL"))
  } else if (!hasProtocol(contact, CONTACT_PROTOCOLS)) {
    problems.push({
      name: "CUSTOMER_SERVICE_URL",
      remedy: `"${contact}" is not a link a shopper can open. Use an absolute http(s) URL or a mailto: address.`,
    })
  }

  return problems
}

function requirementNamed(name: (typeof REQUIRED_ENV)[number]["name"]) {
  const { remedy } = REQUIRED_ENV.find((r) => r.name === name)!
  return { name, remedy }
}

function hasProtocol(value: string, protocols: string[]): boolean {
  try {
    return protocols.includes(new URL(value).protocol)
  } catch {
    return false
  }
}
