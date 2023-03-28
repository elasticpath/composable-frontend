import { AlgoliaIntegrationCreateResult } from "@elasticpath/mason-common"

export function formatAlgoliaIntegrationResponse(
  result: AlgoliaIntegrationCreateResult
): string {
  if (result.success) {
    return `✔ Successful setup of ${result.name} integration in the integrations hub.`
  } else {
    const { name, error, code, reason } = result
    return `Failed to setup ${name} integration with error code ${code} and reason "${reason}". ${
      error ? `Errors: ${JSON.stringify(error)}` : ""
    }`
  }
}
