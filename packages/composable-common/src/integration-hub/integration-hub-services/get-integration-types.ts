import {
  GetIntegrationQuery,
  GetMarketplaceIntegrationByNameQuery,
} from "../../codegen/gql/graphql"

export type IntegrationData = Omit<
  Exclude<GetIntegrationQuery["integration"], null | undefined>,
  "__typename"
>

type Unpacked<T> = T extends (infer U)[] ? U : T

export type MarketplaceIntegrationData = Unpacked<
  Omit<
    Exclude<
      GetMarketplaceIntegrationByNameQuery["marketplaceIntegrations"]["nodes"],
      null | undefined
    >,
    "__typename"
  >
>
