import { graphql } from "../../codegen/gql"

export const GetMarketplaceIntegrationByNameDocument = graphql(/* GraphQL */ `
  query getMarketplaceIntegrationByName($name: String) {
    marketplaceIntegrations(name: $name) {
      nodes {
        id
        name
        versionNumber
      }
    }
  }
`)
