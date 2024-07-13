import algoliasearch, { SearchIndex } from "algoliasearch"
import { SetupResponse } from "./types"
import { resolveErrorResponse } from "./resolve-error"
import { configureAlgoliaFacets } from "./setup-facets"
import type { SetSettingsResponse, Settings } from "@algolia/client-search"

export async function doesIndexExist({
  algoliaAdminKey,
  algoliaAppId,
  algoliaIndex,
}: {
  algoliaAdminKey: string
  algoliaAppId: string
  algoliaIndex: string
}) {
  const client = algoliasearch(algoliaAppId, algoliaAdminKey)
  const index = client.initIndex(algoliaIndex)
  return index.exists()
}

export async function additionalAlgoliaSetup({
  algoliaAdminKey,
  algoliaAppId,
  algoliaIndex,
}: {
  algoliaAdminKey: string
  algoliaAppId: string
  algoliaIndex: string
}): Promise<SetupResponse> {
  const client = algoliasearch(algoliaAppId, algoliaAdminKey)
  const index = client.initIndex(algoliaIndex)

  try {
    const settingsConfiguration = configureSettings(
      configureAlgoliaFacets,
      configureSearchableAttributes,
      configureReplicas(algoliaIndex),
    )

    const result = await executeSettings(index, settingsConfiguration)

    return {
      success: true,
      result: result,
    }
  } catch (err: unknown) {
    return resolveErrorResponse(
      "UNKNOWN",
      err instanceof Error ? err : undefined,
    )
  }
}

async function executeSettings(
  index: SearchIndex,
  settings: Settings,
): Promise<SetSettingsResponse> {
  return index.setSettings(settings)
}

function configureSettings(
  ...args: ((settings: Settings) => Settings)[]
): Settings {
  return args.reduce((settings, nextFn) => {
    return nextFn(settings)
  }, {} as Settings)
}

function configureSearchableAttributes(sourceSettings: Settings): Settings {
  const { searchableAttributes } = sourceSettings
  return {
    ...sourceSettings,
    searchableAttributes: [
      ...(searchableAttributes ?? []),
      "ep_name",
      "ep_description",
      "ep_sku",
    ],
  }
}

function configureReplicas(
  mainIndexName: string,
): (settings: Settings) => Settings {
  return function innerConfigureReplicas(sourceSettings: Settings): Settings {
    const { replicas } = sourceSettings
    return {
      ...sourceSettings,
      replicas: [
        ...(replicas ?? []),
        `${mainIndexName}_price_asc`,
        `${mainIndexName}_price_desc`,
      ],
    }
  }
}
