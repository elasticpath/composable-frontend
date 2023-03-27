import { createTRPCProxyClient, httpLink } from "@trpc/client"
import { AppRouter } from "@elasticpath/mason-integration-hub-deployer"
import { MASON_INTEGRATION_HUB_DEPLOYER_URL } from "@elasticpath/mason-common"

const IH_DEPLOYER_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8888/.netlify/functions"
    : MASON_INTEGRATION_HUB_DEPLOYER_URL

export function createTRPCClient(token: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${IH_DEPLOYER_URL}/trpc`,
        headers: () => {
          return {
            Authorization: `Bearer ${token}`,
          }
        },
      }),
    ],
  })
}
