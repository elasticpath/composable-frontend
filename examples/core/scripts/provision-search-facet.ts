import {
  createCatalogSearchClient,
  createIndexableFields,
  listIndexableFields,
  listSearchIndexes,
  reindexTenantReleases,
  updateIndexableFields,
  type Client,
  type IndexableFieldRequest,
} from "@epcc-sdk/sdks-catalog-search"
import {
  chooseIndexableFieldsTarget,
  facetFieldNameProblem,
  mergeFacetableField,
} from "./indexable-fields"
import {
  waitForIndexesInSync,
  type OutOfSyncListing,
} from "./wait-for-index-sync"

const INDEXABLE_FIELDS_TYPE = "catalog_search_indexable_fields"
const POLL_INTERVAL_MS = 10_000
const REINDEX_TIMEOUT_MS = 15 * 60_000

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    fail(`Missing ${name}. See the README for what to set.`)
  }

  return value
}

function fail(message: string, detail?: unknown): never {
  console.error(message)
  if (detail !== undefined) {
    console.error(JSON.stringify(detail, null, 2))
  }
  process.exit(1)
}

function withScheme(endpoint: string): string {
  return /^https?:\/\//.test(endpoint) ? endpoint : `https://${endpoint}`
}

function printFields(heading: string, fields: IndexableFieldRequest[] = []) {
  console.log(`\n${heading} (${fields.length}):`)
  for (const field of fields) {
    console.log(
      `  ${field.name}  facetable=${field.facetable ?? false} sortable=${field.sortable ?? false}`,
    )
  }
}

async function main() {
  const field = requireEnv("NEXT_PUBLIC_SEARCH_TAXONOMY_FIELD")
  const nameProblem = facetFieldNameProblem(field)
  if (nameProblem) fail(nameProblem)

  const client = createCatalogSearchClient({
    baseUrl: withScheme(requireEnv("EP_ENDPOINT_URL")),
    clientId: requireEnv("EP_ADMIN_CLIENT_ID"),
    clientSecret: requireEnv("EP_ADMIN_CLIENT_SECRET"),
  })

  const changed = await registerFacetableField(client, field)
  await reindexAndWait(client, changed)
}

async function registerFacetableField(
  client: Client,
  field: string,
): Promise<boolean> {
  const listed = await listIndexableFields({ client })
  if (listed.error || !listed.data) {
    fail(
      "Could not read the store's indexable fields. The key must be an admin client_credentials key.",
      listed.error,
    )
  }

  const target = chooseIndexableFieldsTarget(listed.data.data)
  if (target.kind === "organization-owned") {
    fail(
      "This store's indexable fields are owned by its organization and cannot be changed from the store. Register the field at the organization instead.",
    )
  }

  const current = target.kind === "update" ? target.attributes : undefined
  printFields("Registered before", current?.fields)

  const { attributes, changed } = mergeFacetableField(current, field)
  if (!changed) {
    console.log(
      `\n"${field}" is already registered as facetable. Nothing to write.`,
    )
    return false
  }

  const written =
    target.kind === "update"
      ? await updateIndexableFields({
          client,
          path: { indexable_fields_id: target.id },
          body: {
            data: { id: target.id, type: INDEXABLE_FIELDS_TYPE, attributes },
          },
        })
      : await createIndexableFields({
          client,
          body: { data: { type: INDEXABLE_FIELDS_TYPE, attributes } },
        })

  if (written.response?.status === 409) {
    fail(
      "A reindex is already queued or running, and fields cannot change until it finishes. Re-run this script when it has.",
    )
  }
  if (written.error || !written.data) {
    fail(`Could not register "${field}".`, written.error)
  }

  printFields("Registered after", written.data.data.attributes.fields)
  return true
}

async function listOutOfSyncIndexes(client: Client): Promise<OutOfSyncListing> {
  const listing = await listSearchIndexes({
    client,
    query: { out_of_sync: true },
  })
  return { data: listing.data?.data, error: listing.error }
}

async function reindexAndWait(client: Client, fieldsChanged: boolean) {
  if (!fieldsChanged) {
    const outOfSync = await listOutOfSyncIndexes(client)
    if (outOfSync.error || !outOfSync.data) {
      fail("Could not read the search indexes.", outOfSync.error)
    }
    if (outOfSync.data.length === 0) {
      console.log("Every search index is in sync. Done.")
      return
    }
  }

  const reindex = await reindexTenantReleases({
    client,
    body: { data: { force_reindex: false } },
  })

  if (reindex.response?.status === 409) {
    console.log("\nA reindex is already running. Waiting for it to finish.")
  } else if (reindex.error) {
    fail("Could not start the reindex.", reindex.error)
  } else {
    console.log(
      "\nReindex requested. Waiting for every search index to be in sync.",
    )
  }

  const outcome = await waitForIndexesInSync({
    intervalMs: POLL_INTERVAL_MS,
    timeoutMs: REINDEX_TIMEOUT_MS,
    listOutOfSync: () => listOutOfSyncIndexes(client),
    onPoll: (outOfSync) =>
      console.log(`  ${outOfSync.length} search index(es) out of sync`),
  })

  switch (outcome.status) {
    case "in-sync":
      console.log("Every search index is in sync. Done.")
      return
    case "timed-out":
      fail(
        `Still out of sync after ${REINDEX_TIMEOUT_MS / 60_000} minutes. Re-run this script to keep waiting; it does not register the field twice. Releases still out of sync:\n${outcome.outOfSync
          .map(
            (index) =>
              `  catalog ${index.meta.catalog_id} release ${index.meta.release_id}`,
          )
          .join("\n")}`,
      )
    case "failed":
      fail("Stopped while waiting for the reindex.", outcome.error)
  }
}

main().catch((error) => fail("Provisioning failed.", String(error)))
