import { graphql } from "../../../codegen/gql"

export const GetIntegrationDocument = graphql(/* GraphQL */ `
  query getIntegration($id: ID!) {
    integration(id: $id) {
      id
      name
      description
    }
  }
`)

export const CreateInstanceDocument = graphql(/* GraphQL */ `
  mutation createInstance(
    $integrationId: ID!
    $customerId: ID!
    $name: String!
    $description: String
    $labels: [String]
    $configVariables: [InputInstanceConfigVariable]
  ) {
    createInstance(
      input: {
        name: $name
        description: $description
        labels: $labels
        integration: $integrationId
        customer: $customerId
        configVariables: $configVariables
      }
    ) {
      instance {
        id
        name
        description
        labels
        customer {
          id
          name
          __typename
        }
        integration {
          id
          name
          versionNumber
          __typename
        }
        configVariables {
          nodes {
            id
            authorizeUrl
            status
            value
            requiredConfigVariable {
              dataType
            }
          }
        }
        __typename
      }
      errors {
        field
        messages
        __typename
      }
      __typename
    }
  }
`)
export const GetMarketplaceIntegrationDocument = graphql(/* GraphQL */ `
  query getMarketplaceIntegration($integrationId: ID!) {
    marketplaceIntegration(id: $integrationId) {
      id
      name
      description
      isCustomerDeployable
      versionIsAvailable
      versionIsLatest
      versionNumber
      versionComment
      versionCreatedAt
    }
  }
`)
