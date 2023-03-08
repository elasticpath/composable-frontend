#!/usr/bin/env ts-node
import { AlgoliaIntegrationSetupResponse } from "./types"
import { getIntegration } from "./integration-hub-services/get-integration"
import { getUserInfo } from "./integration-hub-services/get-user-info"
import { doesIntegrationInstanceExist } from "./integration-hub-services/does-integration-exist"
import { createAlgoliaIntegrationConfig } from "./algolia-integration-config"
import {
  createWebhookSecretKey,
  didRequestFail,
  resolveErrorResponse,
} from "./helpers"
import { ALGOLIA_INTEGRATION_ID, ALGOLIA_INTEGRATION_NAME } from "./constants"
import { createEpccApiKey } from "./epcc-services/api-keys"
import { performConnectionConfigAuthorisation } from "./integration-hub-services/connection-authorisation"
import { createIntegrationInstance } from "./integration-hub-services/create-integration-instance"
import { createEpccClient } from "./epcc-services/create-epcc-client"
import { deployIntegrationInstance } from "./integration-hub-services/deploy-integration-instance"
import {
  createUrqlClient,
  EpccRegion,
} from "./integration-hub-services/create-urql-client"
import { integrationAuthToken } from "./integration-hub-services/integration-auth"
import { resolveEpccBaseUrl } from "../resolve-epcc-url"
import { additionalAlgoliaSetup } from "../algolia/algolia"

const _importDynamic = new Function("modulePath", "return import(modulePath)")

export const fetch = async function (...args: any) {
  const { default: fetch } = await _importDynamic("node-fetch")
  return fetch(...args)
}

export async function main(
  argv: {},
  sourceInput: RequiredInput
): Promise<AlgoliaIntegrationSetupResponse> {
  try {
    const {
      host: epccHost,
      clientId: epccClientId,
      clientSecret: epccClientSecret,
    } = sourceInput.epccConfig
    const epccClient = createEpccClient({
      host: epccHost,
      client_id: epccClientId,
      client_secret: epccClientSecret,
    })

    /**
     * Get the prismatic auth token from EPCC
     */
    const tokenResp = await integrationAuthToken(epccClient)
    console.log("tokenResp: ", tokenResp)

    if (didRequestFail(tokenResp)) {
      return resolveErrorResponse(
        "EPCC_INTEGRATION_AUTH_TOKEN",
        tokenResp.error
      )
    }

    const urqlClient = createUrqlClient(tokenResp.data.jwtToken, epccHost)

    /**
     * Get the user info for the customer
     */
    const userInfo = await getUserInfo(urqlClient)
    console.log("userInfo: ", userInfo)

    if (didRequestFail(userInfo)) {
      return resolveErrorResponse("INTEGRATION_USER_DETAILS", userInfo.error)
    }

    const customerId = userInfo.data.customer?.id

    if (customerId === undefined) {
      return resolveErrorResponse("MISSING_CUSTOMER_ID")
    }

    /**
     * Check if instance exists on epcc store
     */
    const doesExist = await doesIntegrationInstanceExist(
      urqlClient,
      customerId,
      ALGOLIA_INTEGRATION_NAME
    )
    console.log("does integration instance exist?: ", doesExist)

    if (doesExist) {
      return resolveErrorResponse("ALREADY_INTEGRATION_INSTANCE")
    }

    const integrationResp = await getIntegration(urqlClient, {
      id: ALGOLIA_INTEGRATION_ID,
    })
    console.log("getIntegration: ", integrationResp)

    if (didRequestFail(integrationResp)) {
      return resolveErrorResponse(
        "INTEGRATION_GET_INTEGRATION",
        integrationResp.error
      )
    }

    const { name, id, description } = integrationResp.data
    const apiKeyResp = await createEpccApiKey(
      epccClient,
      `algolia-integration-${new Date().toISOString()}`
    )

    if (didRequestFail(apiKeyResp)) {
      return resolveErrorResponse("EPCC_API_KEYS", apiKeyResp.error)
    }

    const { client_id, client_secret } = apiKeyResp.data

    if (!client_secret) {
      return resolveErrorResponse("EPCC_API_KEYS_SECRET")
    }

    const { appId: algoliaAppId, adminApiKey: algoliaAdminApiKey } =
      sourceInput.algolia

    const epccBaseUrl = resolveEpccBaseUrl(epccHost)

    const createdInstanceResponse = await createIntegrationInstance(
      urqlClient,
      {
        integrationId: id,
        customerId,
        name,
        description,
        configVariables: createAlgoliaIntegrationConfig({
          algoliaAppId,
          algoliaAdminApiKey,
          epccComponentConnectionShared: {
            clientId: client_id,
            clientSecret: client_secret,
            tokenUrl: `${epccBaseUrl}/oauth/access_token`,
          },
          webhookKey: createWebhookSecretKey(),
          epccBaseUrl: `${epccBaseUrl}`,
        }),
      }
    )

    if (didRequestFail(createdInstanceResponse)) {
      return resolveErrorResponse(
        "CREATE_INTEGRATION_INSTANCE",
        createdInstanceResponse.error
      )
    }

    console.log(
      "response to create integration instance: ",
      createdInstanceResponse.data
    )

    const createdInstance = createdInstanceResponse.data

    const val = await performConnectionConfigAuthorisation(createdInstance)
    console.log("auth attempt responses: ", val)

    const deployResult = await deployIntegrationInstance(urqlClient, {
      instanceId: createdInstance.id,
    })

    if (didRequestFail(deployResult)) {
      return resolveErrorResponse(
        "DEPLOY_INTEGRATION_INSTANCE",
        deployResult.error
      )
    }

    console.log(
      "deploy result: ",
      deployResult.data.errors,
      deployResult.data.instance
    )
    return {
      success: true,
      result: deployResult.data.instance,
    }
  } catch (err: unknown) {
    console.error(err)
    return resolveErrorResponse(
      "UNKNOWN",
      err instanceof Error ? err : undefined
    )
  }
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
    clientId: "5rJZsYfUeaHrMDEmbMsuSL5kUiqyqxDPYHlUUBZaFR",
    clientSecret: "***REMOVED***",
  },
  algolia: {
    appId: "WLWW1KHAQA",
    adminApiKey: "***REMOVED***",
  },
}

main(process.argv, input)
  .then((result) => {
    console.log("result: ", result)
    return additionalAlgoliaSetup({
      algoliaIndex: "",
      algoliaAdminKey: "",
      algoliaAppId: "",
    })
  })
  .then((x) => {
    console.log("algolia setup: ", x)
  })
