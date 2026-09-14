/**
 * Creates the Commerce Extensions structure this example reads and writes.
 *
 * Run it with admin credentials in your shell, never in a file the application
 * loads:
 *
 *   EP_ADMIN_CLIENT_ID=... EP_ADMIN_CLIENT_SECRET=... \
 *   EP_ENDPOINT_URL=https://euwest.api.elasticpath.com \
 *   pnpm provision
 *
 * It creates one Custom API and two Custom Fields. Running it twice is safe:
 * anything that already exists is reported and left alone.
 */
import {
  client,
  createACustomApi,
  createACustomField,
  getAllCustomApis,
  getAllCustomFields,
} from "@epcc-sdk/commerce-extensions"
import { createAnAccessToken } from "@epcc-sdk/sdks-shopper"

const SLUG = "saved-list-items"
const API_TYPE = "saved_list_item_ext"

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

  const auth = await createAnAccessToken({
    baseUrl,
    body: {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    },
  })

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
  await ensureField(customApiId, {
    name: "Account ID",
    slug: "account_id",
    description:
      "The account that owns this entry. Written by the server from the signed-in session, never by the browser.",
  })
  await ensureField(customApiId, {
    name: "Product ID",
    slug: "product_id",
    description: "The saved product.",
  })

  console.log("")
  console.log("Done. The example needs no id in its environment: it looks the")
  console.log(`Custom API up by slug "${SLUG}" at startup.`)
}

async function ensureCustomApi(): Promise<string> {
  const existing = await getAllCustomApis({
    query: { filter: `eq(slug,${SLUG})` },
  })

  const found = existing.data?.data?.[0]

  if (found?.id) {
    console.log(`Custom API "${SLUG}" already exists (${found.id}).`)
    return found.id
  }

  const created = await createACustomApi({
    body: {
      data: {
        type: "custom_api",
        name: "Saved List Items",
        description:
          "One entry per product a shopper has saved. Entries carry the owning account id; the storefront enforces it.",
        slug: SLUG,
        api_type: API_TYPE,
        allow_upserts: false,
      },
    },
  })

  const id = created.data?.data?.id

  if (!id) {
    console.error("Failed to create the Custom API:", created.error)
    process.exit(1)
  }

  console.log(`Created Custom API "${SLUG}" (${id}).`)
  return id
}

async function ensureField(
  customApiId: string,
  field: { name: string; slug: string; description: string },
) {
  const existing = await getAllCustomFields({
    path: { custom_api_id: customApiId },
    query: { filter: `eq(slug,${field.slug})` },
  })

  if (existing.data?.data?.[0]?.id) {
    console.log(`Custom Field "${field.slug}" already exists.`)
    return
  }

  const created = await createACustomField({
    path: { custom_api_id: customApiId },
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
            // An entry may not change hands after it is written.
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
