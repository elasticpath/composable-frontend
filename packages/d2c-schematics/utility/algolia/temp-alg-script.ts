#!/usr/bin/env ts-node
import { additionalAlgoliaSetup } from "../algolia/algolia"
import { SetupResponse } from "./types"
import { EpccRegion } from "@elasticpath/composable-common"
const _importDynamic = new Function("modulePath", "return import(modulePath)")

export const fetch = async function (...args: any) {
  const { default: fetch } = await _importDynamic("node-fetch")
  return fetch(...args)
}

export async function main(
  argv: {},
  sourceInput: RequiredInput
): Promise<SetupResponse> {
  return additionalAlgoliaSetup({
    algoliaIndex: "2022_Catalog_e4c2d061-temp",
    algoliaAdminKey: sourceInput.algolia.adminApiKey,
    algoliaAppId: sourceInput.algolia.appId,
  })
}

interface RequiredInput {
  epccConfig: {
    host: EpccRegion
    clientId: string
    clientSecret: string
  }
  algolia: {
    appId: string
    adminApiKey: string
  }
}

const input: RequiredInput = {
  epccConfig: {
    host: "epcc-integration.global.ssl.fastly.net",
    clientId: "use-key",
    clientSecret: "use-key",
  },
  algolia: {
    appId: "use-key",
    adminApiKey: "use-key",
  },
}

main(process.argv, input).then((result) => {
  console.log("result: ", result)
})
