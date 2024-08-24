import { ConfStoreData } from "../../integration/algolia/algolia-integration-command"
import { AlgoliaIntegrationSetup } from "../../integration/algolia/utility/integration-hub/setup-algolia-schema"
import { KlevuIntegrationSetup } from "../../integration/klevu/utility/integration-hub/setup-klevu-schema"
import { resolveHostFromRegion } from "../../../util/resolve-region"
import { GatheredOptions } from "./types"

export function resolveSourceInput(
  gatheredOptions: GatheredOptions,
  confData: ConfStoreData,
) {
  let options: AlgoliaIntegrationSetup | KlevuIntegrationSetup | undefined
  if (gatheredOptions.plpType === "Algolia") {
    options = {
      appId: gatheredOptions.algoliaApplicationId!,
      adminApiKey: gatheredOptions.algoliaAdminApiKey!,
      host: hostFromConfData(confData),
      accessToken: confData.token,
    } as AlgoliaIntegrationSetup
  } else if (gatheredOptions.plpType === "Klevu") {
    options = {
      apiKey: gatheredOptions.klevuApiKey!,
      searchUrl: gatheredOptions.klevuSearchURL!,
      restAuthKey: gatheredOptions.klevuRestAuthKey!,
      host: hostFromConfData(confData),
      accessToken: confData.token,
    } as KlevuIntegrationSetup
  }
  return options
}

function hostFromConfData(confData: ConfStoreData) {
  return new URL(resolveHostFromRegion(confData.region)).host
}
