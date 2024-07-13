/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query checkIfInstanceNameExists($customerId: ID!, $name: String!) {\n    instances(name_Icontains: $name, customer: $customerId) {\n      nodes {\n        id\n        name\n        __typename\n      }\n      __typename\n    }\n  }\n": types.CheckIfInstanceNameExistsDocument,
    "\n  mutation deployInstance($instanceId: ID!) {\n    deployInstance(input: { id: $instanceId }) {\n      errors {\n        field\n        messages\n        __typename\n      }\n      instance {\n        id\n        name\n        customer {\n          id\n          name\n          __typename\n        }\n        integration {\n          id\n          name\n          versionNumber\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n  }\n": types.DeployInstanceDocument,
    "\n  query getIntegration($id: ID!) {\n    integration(id: $id) {\n      id\n      name\n      description\n    }\n  }\n": types.GetIntegrationDocument,
    "\n  mutation createInstance(\n    $integrationId: ID!\n    $customerId: ID!\n    $name: String!\n    $description: String\n    $labels: [String]\n    $configVariables: [InputInstanceConfigVariable]\n  ) {\n    createInstance(\n      input: {\n        name: $name\n        description: $description\n        labels: $labels\n        integration: $integrationId\n        customer: $customerId\n        configVariables: $configVariables\n      }\n    ) {\n      instance {\n        id\n        name\n        description\n        labels\n        customer {\n          id\n          name\n          __typename\n        }\n        integration {\n          id\n          name\n          versionNumber\n          __typename\n        }\n        configVariables {\n          nodes {\n            id\n            authorizeUrl\n            status\n            value\n            requiredConfigVariable {\n              dataType\n            }\n          }\n        }\n        __typename\n      }\n      errors {\n        field\n        messages\n        __typename\n      }\n      __typename\n    }\n  }\n": types.CreateInstanceDocument,
    "\n  query getMarketplaceIntegration($integrationId: ID!) {\n    marketplaceIntegration(id: $integrationId) {\n      id\n      name\n      description\n      isCustomerDeployable\n      versionIsAvailable\n      versionIsLatest\n      versionNumber\n      versionComment\n      versionCreatedAt\n    }\n  }\n": types.GetMarketplaceIntegrationDocument,
    "\n  query getMarketplaceIntegrationByName($name: String) {\n    marketplaceIntegrations(name: $name) {\n      nodes {\n        id\n        name\n        versionNumber\n      }\n    }\n  }\n": types.GetMarketplaceIntegrationByNameDocument,
    "\n  query getUserInfo {\n    authenticatedUser {\n      ...userInfo\n      __typename\n    }\n  }\n": types.GetUserInfoDocument,
    "\n  fragment userInfo on User {\n    id\n    email\n    name\n    avatarUrl\n    appName\n    marketplaceName\n    appAvatarUrl\n    darkMode\n    darkModeSyncWithOs\n    dateJoined\n    featureFlags\n    org {\n      id\n      name\n      avatarUrl\n      currentPlan\n      overdue\n      featureFlags\n      allowExecutionRetryConfig\n      allowAddUser\n      allowAddCustomer\n      allowCustomTheme\n      allowConfigureThemes\n      allowViewBilling\n      allowAddAlertGroup\n      allowAddIntegration\n      allowAddAlertWebhook\n      allowAddCredential\n      allowAddExternalLogStream\n      allowAddSigningKey\n      allowEnableInstance\n      allowExecuteInstance\n      allowPublishComponent\n      allowRemove\n      allowUpdate\n      allowConfigureEmbedded\n      allowConfigureExternalLogStreams\n      allowConfigureCredentials\n      allowUserLevelConfig\n      __typename\n    }\n    customer {\n      id\n      org {\n        id\n        __typename\n      }\n      name\n      avatarUrl\n      allowAddUser\n      allowRemove\n      allowUpdate\n      allowConfigureCredentials\n      allowAddInstance\n      externalId\n      __typename\n    }\n    role {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n": types.UserInfoFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query checkIfInstanceNameExists($customerId: ID!, $name: String!) {\n    instances(name_Icontains: $name, customer: $customerId) {\n      nodes {\n        id\n        name\n        __typename\n      }\n      __typename\n    }\n  }\n"): (typeof documents)["\n  query checkIfInstanceNameExists($customerId: ID!, $name: String!) {\n    instances(name_Icontains: $name, customer: $customerId) {\n      nodes {\n        id\n        name\n        __typename\n      }\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deployInstance($instanceId: ID!) {\n    deployInstance(input: { id: $instanceId }) {\n      errors {\n        field\n        messages\n        __typename\n      }\n      instance {\n        id\n        name\n        customer {\n          id\n          name\n          __typename\n        }\n        integration {\n          id\n          name\n          versionNumber\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n  }\n"): (typeof documents)["\n  mutation deployInstance($instanceId: ID!) {\n    deployInstance(input: { id: $instanceId }) {\n      errors {\n        field\n        messages\n        __typename\n      }\n      instance {\n        id\n        name\n        customer {\n          id\n          name\n          __typename\n        }\n        integration {\n          id\n          name\n          versionNumber\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getIntegration($id: ID!) {\n    integration(id: $id) {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  query getIntegration($id: ID!) {\n    integration(id: $id) {\n      id\n      name\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createInstance(\n    $integrationId: ID!\n    $customerId: ID!\n    $name: String!\n    $description: String\n    $labels: [String]\n    $configVariables: [InputInstanceConfigVariable]\n  ) {\n    createInstance(\n      input: {\n        name: $name\n        description: $description\n        labels: $labels\n        integration: $integrationId\n        customer: $customerId\n        configVariables: $configVariables\n      }\n    ) {\n      instance {\n        id\n        name\n        description\n        labels\n        customer {\n          id\n          name\n          __typename\n        }\n        integration {\n          id\n          name\n          versionNumber\n          __typename\n        }\n        configVariables {\n          nodes {\n            id\n            authorizeUrl\n            status\n            value\n            requiredConfigVariable {\n              dataType\n            }\n          }\n        }\n        __typename\n      }\n      errors {\n        field\n        messages\n        __typename\n      }\n      __typename\n    }\n  }\n"): (typeof documents)["\n  mutation createInstance(\n    $integrationId: ID!\n    $customerId: ID!\n    $name: String!\n    $description: String\n    $labels: [String]\n    $configVariables: [InputInstanceConfigVariable]\n  ) {\n    createInstance(\n      input: {\n        name: $name\n        description: $description\n        labels: $labels\n        integration: $integrationId\n        customer: $customerId\n        configVariables: $configVariables\n      }\n    ) {\n      instance {\n        id\n        name\n        description\n        labels\n        customer {\n          id\n          name\n          __typename\n        }\n        integration {\n          id\n          name\n          versionNumber\n          __typename\n        }\n        configVariables {\n          nodes {\n            id\n            authorizeUrl\n            status\n            value\n            requiredConfigVariable {\n              dataType\n            }\n          }\n        }\n        __typename\n      }\n      errors {\n        field\n        messages\n        __typename\n      }\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getMarketplaceIntegration($integrationId: ID!) {\n    marketplaceIntegration(id: $integrationId) {\n      id\n      name\n      description\n      isCustomerDeployable\n      versionIsAvailable\n      versionIsLatest\n      versionNumber\n      versionComment\n      versionCreatedAt\n    }\n  }\n"): (typeof documents)["\n  query getMarketplaceIntegration($integrationId: ID!) {\n    marketplaceIntegration(id: $integrationId) {\n      id\n      name\n      description\n      isCustomerDeployable\n      versionIsAvailable\n      versionIsLatest\n      versionNumber\n      versionComment\n      versionCreatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getMarketplaceIntegrationByName($name: String) {\n    marketplaceIntegrations(name: $name) {\n      nodes {\n        id\n        name\n        versionNumber\n      }\n    }\n  }\n"): (typeof documents)["\n  query getMarketplaceIntegrationByName($name: String) {\n    marketplaceIntegrations(name: $name) {\n      nodes {\n        id\n        name\n        versionNumber\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getUserInfo {\n    authenticatedUser {\n      ...userInfo\n      __typename\n    }\n  }\n"): (typeof documents)["\n  query getUserInfo {\n    authenticatedUser {\n      ...userInfo\n      __typename\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment userInfo on User {\n    id\n    email\n    name\n    avatarUrl\n    appName\n    marketplaceName\n    appAvatarUrl\n    darkMode\n    darkModeSyncWithOs\n    dateJoined\n    featureFlags\n    org {\n      id\n      name\n      avatarUrl\n      currentPlan\n      overdue\n      featureFlags\n      allowExecutionRetryConfig\n      allowAddUser\n      allowAddCustomer\n      allowCustomTheme\n      allowConfigureThemes\n      allowViewBilling\n      allowAddAlertGroup\n      allowAddIntegration\n      allowAddAlertWebhook\n      allowAddCredential\n      allowAddExternalLogStream\n      allowAddSigningKey\n      allowEnableInstance\n      allowExecuteInstance\n      allowPublishComponent\n      allowRemove\n      allowUpdate\n      allowConfigureEmbedded\n      allowConfigureExternalLogStreams\n      allowConfigureCredentials\n      allowUserLevelConfig\n      __typename\n    }\n    customer {\n      id\n      org {\n        id\n        __typename\n      }\n      name\n      avatarUrl\n      allowAddUser\n      allowRemove\n      allowUpdate\n      allowConfigureCredentials\n      allowAddInstance\n      externalId\n      __typename\n    }\n    role {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n"): (typeof documents)["\n  fragment userInfo on User {\n    id\n    email\n    name\n    avatarUrl\n    appName\n    marketplaceName\n    appAvatarUrl\n    darkMode\n    darkModeSyncWithOs\n    dateJoined\n    featureFlags\n    org {\n      id\n      name\n      avatarUrl\n      currentPlan\n      overdue\n      featureFlags\n      allowExecutionRetryConfig\n      allowAddUser\n      allowAddCustomer\n      allowCustomTheme\n      allowConfigureThemes\n      allowViewBilling\n      allowAddAlertGroup\n      allowAddIntegration\n      allowAddAlertWebhook\n      allowAddCredential\n      allowAddExternalLogStream\n      allowAddSigningKey\n      allowEnableInstance\n      allowExecuteInstance\n      allowPublishComponent\n      allowRemove\n      allowUpdate\n      allowConfigureEmbedded\n      allowConfigureExternalLogStreams\n      allowConfigureCredentials\n      allowUserLevelConfig\n      __typename\n    }\n    customer {\n      id\n      org {\n        id\n        __typename\n      }\n      name\n      avatarUrl\n      allowAddUser\n      allowRemove\n      allowUpdate\n      allowConfigureCredentials\n      allowAddInstance\n      externalId\n      __typename\n    }\n    role {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;