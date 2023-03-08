import { graphql } from "../../../codegen/gql"

export const CheckIfInstanceNameExistsDocument = graphql(/* GraphQL */ `
  query checkIfInstanceNameExists($customerId: ID!, $name: String!) {
    instances(name_Icontains: $name, customer: $customerId) {
      nodes {
        id
        name
        __typename
      }
      __typename
    }
  }
`)

export const DeployIntegrationInstanceDocument = graphql(/* GraphQL */ `
  mutation deployInstance($instanceId: ID!) {
    deployInstance(input: { id: $instanceId }) {
      errors {
        field
        messages
        __typename
      }
      instance {
        id
        name
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
        __typename
      }
      __typename
    }
  }
`)
