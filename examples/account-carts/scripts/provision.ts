import {
  client,
  createACustomApi,
  createACustomField,
  listCustomApis,
  listCustomFields,
} from "@epcc-sdk/commerce-extensions"
import { createAnAccessToken } from "@epcc-sdk/sdks-shopper"
import { SHARES_API_TYPE, SHARES_SLUG } from "../src/app/constants"

const dryRun = process.argv.includes("--dry-run")

const FIELDS = [
  {
    name: "Share token",
    slug: "share_token",
    description:
      "The random token a share link carries. It names this entry and nothing else.",
  },
  {
    name: "Cart ID",
    slug: "cart_id",
    description:
      "The cart the link points to. Written by the server, never put in a link.",
  },
  {
    name: "Account ID",
    slug: "account_id",
    description:
      "The account that made the link. Written by the server from the signed-in session, never by the browser.",
  },
  {
    name: "Shared at",
    slug: "shared_at",
    description: "When the link was made, as an ISO 8601 date and time.",
  },
]

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    console.error(`Missing ${name}. See the README for what to set.`)
    process.exit(1)
  }

  return value
}

async function main() {
  const baseUrl = requireEnv("EP_ENDPOINT_URL")
  const clientId = requireEnv("EP_ADMIN_CLIENT_ID")
  const clientSecret = requireEnv("EP_ADMIN_CLIENT_SECRET")

  if (dryRun) {
    console.log("Dry run: nothing will be created.")
  }

  const auth = await createAnAccessToken({
    baseUrl,
    body: {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    },
  })

  if (auth.error) {
    console.error("Failed to get a client_credentials token:", auth.error)
    process.exit(1)
  }

  const accessToken = auth.data?.access_token

  if (!accessToken) {
    console.error("Could not get a client_credentials token. Check the key.")
    process.exit(1)
  }

  client.setConfig({
    baseUrl,
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const customApiId = await ensureCustomApi()

  for (const field of FIELDS) {
    await ensureField(customApiId, field)
  }

  console.log("")
  console.log("Done. The example needs no id in its environment: it looks the")
  console.log(`Custom API up by slug "${SHARES_SLUG}" at startup.`)
}

async function ensureCustomApi(): Promise<string | undefined> {
  const existing = await listCustomApis({
    query: { filter: `eq(slug,${SHARES_SLUG})` },
  })

  if (existing.error) {
    console.error("Failed to look up the Custom API:", existing.error)
    process.exit(1)
  }

  const found = existing.data?.data?.find(
    (customApi) => customApi.slug === SHARES_SLUG,
  )

  if (found?.id) {
    console.log(`Custom API "${SHARES_SLUG}" already exists (${found.id}).`)
    return found.id
  }

  if (dryRun) {
    console.log(`Would create Custom API "${SHARES_SLUG}".`)
    return undefined
  }

  const created = await createACustomApi({
    body: {
      data: {
        type: "custom_api",
        name: "Cart Shares",
        description:
          "One entry per share link. Entries carry the cart id and the sending account id; the storefront enforces who may list and revoke them.",
        slug: SHARES_SLUG,
        api_type: SHARES_API_TYPE,
        allow_upserts: false,
      },
    },
  })

  const id = created.data?.data?.id

  if (!id) {
    console.error("Failed to create the Custom API:", created.error)
    process.exit(1)
  }

  console.log(`Created Custom API "${SHARES_SLUG}" (${id}).`)
  return id
}

async function ensureField(
  customApiId: string | undefined,
  field: { name: string; slug: string; description: string },
) {
  if (!customApiId) {
    console.log(`Would create Custom Field "${field.slug}".`)
    return
  }

  const existing = await listCustomFields({
    path: { "custom-api-id": customApiId },
    query: { filter: `eq(slug,${field.slug})` },
  })

  if (existing.error) {
    console.error(
      `Failed to look up Custom Field "${field.slug}":`,
      existing.error,
    )
    process.exit(1)
  }

  if (
    existing.data?.data?.some((customField) => customField.slug === field.slug)
  ) {
    console.log(`Custom Field "${field.slug}" already exists.`)
    return
  }

  if (dryRun) {
    console.log(`Would create Custom Field "${field.slug}".`)
    return
  }

  const created = await createACustomField({
    path: { "custom-api-id": customApiId },
    body: {
      data: {
        type: "custom_field",
        name: field.name,
        description: field.description,
        slug: field.slug,
        field_type: "string",
        validation: {
          string: {
            max_length: 64,
            allow_null_values: false,
            immutable: true,
          },
        },
      },
    },
  })

  if (!created.data?.data?.id) {
    console.error(`Failed to create "${field.slug}":`, created.error)
    process.exit(1)
  }

  console.log(`Created Custom Field "${field.slug}".`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
