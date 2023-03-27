#!/usr/bin/env ts-node
import { AlgoliaIntegrationSettings } from "@elasticpath/mason-common"
import { setupAlgoliaIntegration } from "./setup-algolia-integration"

const config: AlgoliaIntegrationSettings = {
  epccConfig: {
    host: "epcc-integration.global.ssl.fastly.net",
    clientId: "5rJZsYfUeaHrMDEmbMsuSL5kUiqyqxDPYHlUUBZaFR",
    clientSecret: "***REMOVED***",
  },
  appId: "WLWW1KHAQA",
  adminApiKey: "***REMOVED***",
  name: "algolia",
}

setupAlgoliaIntegration(config).then((x) => {
  console.log("final result: ", x)
})
