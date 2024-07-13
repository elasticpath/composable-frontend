import { graphql } from "../../codegen/gql"

export const GetUserInfoDocument = graphql(/* GraphQL */ `
  query getUserInfo {
    authenticatedUser {
      ...userInfo
      __typename
    }
  }
`)

export const UserInfoFragment = graphql(/* GraphQL */ `
  fragment userInfo on User {
    id
    email
    name
    avatarUrl
    appName
    marketplaceName
    appAvatarUrl
    darkMode
    darkModeSyncWithOs
    dateJoined
    featureFlags
    org {
      id
      name
      avatarUrl
      currentPlan
      overdue
      featureFlags
      allowExecutionRetryConfig
      allowAddUser
      allowAddCustomer
      allowCustomTheme
      allowConfigureThemes
      allowViewBilling
      allowAddAlertGroup
      allowAddIntegration
      allowAddAlertWebhook
      allowAddCredential
      allowAddExternalLogStream
      allowAddSigningKey
      allowEnableInstance
      allowExecuteInstance
      allowPublishComponent
      allowRemove
      allowUpdate
      allowConfigureEmbedded
      allowConfigureExternalLogStreams
      allowConfigureCredentials
      allowUserLevelConfig
      __typename
    }
    customer {
      id
      org {
        id
        __typename
      }
      name
      avatarUrl
      allowAddUser
      allowRemove
      allowUpdate
      allowConfigureCredentials
      allowAddInstance
      externalId
      __typename
    }
    role {
      id
      name
      __typename
    }
    __typename
  }
`)
