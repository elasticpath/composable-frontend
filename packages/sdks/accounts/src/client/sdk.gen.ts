// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from "@hey-api/client-fetch"
import type {
  GetV2AccountsData,
  GetV2AccountsResponse,
  GetV2AccountsError,
  PostV2AccountsData,
  PostV2AccountsResponse,
  PostV2AccountsError,
  DeleteV2AccountsAccountIdData,
  DeleteV2AccountsAccountIdResponse,
  DeleteV2AccountsAccountIdError,
  GetV2AccountsAccountIdData,
  GetV2AccountsAccountIdResponse,
  GetV2AccountsAccountIdError,
  PutV2AccountsAccountIdData,
  PutV2AccountsAccountIdResponse,
  PutV2AccountsAccountIdError,
  GetV2AccountMembersData,
  GetV2AccountMembersResponse,
  GetV2AccountMembersError,
  GetV2AccountMembersAccountMemberIdData,
  GetV2AccountMembersAccountMemberIdResponse,
  GetV2AccountMembersAccountMemberIdError,
  GetV2AccountsAccountIdAccountMembershipsData,
  GetV2AccountsAccountIdAccountMembershipsResponse,
  GetV2AccountsAccountIdAccountMembershipsError,
  PostV2AccountsAccountIdAccountMembershipsData,
  PostV2AccountsAccountIdAccountMembershipsResponse,
  PostV2AccountsAccountIdAccountMembershipsError,
  GetV2AccountMembersAccountMemberIdAccountMembershipsData,
  GetV2AccountMembersAccountMemberIdAccountMembershipsResponse,
  GetV2AccountMembersAccountMemberIdAccountMembershipsError,
  GetV2AccountsAccountIdAccountMembershipsUnassignedAccountMembersData,
  GetV2AccountsAccountIdAccountMembershipsUnassignedAccountMembersResponse,
  GetV2AccountsAccountIdAccountMembershipsUnassignedAccountMembersError,
  DeleteV2AccountsAccountIdAccountMembershipsMembershipIdData,
  DeleteV2AccountsAccountIdAccountMembershipsMembershipIdResponse,
  DeleteV2AccountsAccountIdAccountMembershipsMembershipIdError,
  GetV2AccountsAccountIdAccountMembershipsMembershipIdData,
  GetV2AccountsAccountIdAccountMembershipsMembershipIdResponse,
  GetV2AccountsAccountIdAccountMembershipsMembershipIdError,
  PutV2AccountsAccountIdAccountMembershipsMembershipIdData,
  PutV2AccountsAccountIdAccountMembershipsMembershipIdResponse,
  PutV2AccountsAccountIdAccountMembershipsMembershipIdError,
  GetV2SettingsAccountMembershipData,
  GetV2SettingsAccountMembershipResponse,
  GetV2SettingsAccountMembershipError,
  PutV2SettingsAccountMembershipData,
  PutV2SettingsAccountMembershipResponse,
  PutV2SettingsAccountMembershipError,
  GetV2SettingsAccountAuthenticationData,
  GetV2SettingsAccountAuthenticationResponse,
  GetV2SettingsAccountAuthenticationError,
  PutV2SettingsAccountAuthenticationData,
  PutV2SettingsAccountAuthenticationResponse,
  PutV2SettingsAccountAuthenticationError,
  PostV2AccountMembersTokensData,
  PostV2AccountMembersTokensResponse,
  PostV2AccountMembersTokensError,
} from "./types.gen"

export const client = createClient(createConfig())

/**
 * Get All Accounts
 * Use this endpoint to Get all accounts.
 *
 * You can use pagination with this resource. For more information, see [pagination](/guides/Getting-Started/pagination).
 *
 * ### Filtering
 *
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) accounts:
 *
 * | Attribute       | Type     | Operators    | Example                                              |
 * |-----------------|----------|--------------| -----------------------------------------------------|
 * | `name` | `string` | <ul><li>`eq`</li><li>`like`</li></ul> | `like(name,*swan*)` |
 * | `legal_name` | `string` | <ul><li>`eq`</li><li>`like`</li></ul> | `like(legal_name,*swan*)` |
 * | `registration_id` | `string` | <ul><li>`eq`</li><li>`like`</li></ul> | `like(registration_id,00000000-0000-1000-8000-*)` |
 * | `external_ref` |  `string` | <ul><li>`eq`</li><li>`like`</li></ul> | `like(external_ref,16be*)` |
 * | `id` |  `string` | <ul><li>`eq`</li><li>`ge`</li><li>`gt`</li><li>`le`</li><li>`lt`</li><li>`in`</li></ul> | `in(id,"99248259-feea-40c6-b855-f719ee87a539", "363e4505-a2bb-4bc1-b667-2cc9a4de8668")` |
 * | `created_at` | `string` | <ul><li>`eq`</li><li>`ge`</li><li>`gt`</li><li>`le`</li><li>`lt`</li></ul> | `gt(created_at,"2021-06-02T18:44:07.617Z")` |
 * | `updated_at` | `string` | <ul><li>`eq`</li><li>`ge`</li><li>`gt`</li><li>`le`</li><li>`lt`</li></ul> | `ge(updated_at,"2021-06-07T18:24:48.149Z")` |
 */
export const getV2Accounts = <ThrowOnError extends boolean = false>(
  options?: Options<GetV2AccountsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2AccountsResponse,
    GetV2AccountsError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts",
  })
}

/**
 * Create an Account
 * With the account creation endpoint, you have the ability to create accounts which can optionally have another account as a parent.
 */
export const postV2Accounts = <ThrowOnError extends boolean = false>(
  options?: Options<PostV2AccountsData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    PostV2AccountsResponse,
    PostV2AccountsError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts",
  })
}

/**
 * Delete an Account
 * Delete a specific account within a store
 */
export const deleteV2AccountsAccountId = <ThrowOnError extends boolean = false>(
  options: Options<DeleteV2AccountsAccountIdData, ThrowOnError>,
) => {
  return (options?.client ?? client).delete<
    DeleteV2AccountsAccountIdResponse,
    DeleteV2AccountsAccountIdError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}",
  })
}

/**
 * Get an Account
 * View a specific account contained within your store
 */
export const getV2AccountsAccountId = <ThrowOnError extends boolean = false>(
  options: Options<GetV2AccountsAccountIdData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2AccountsAccountIdResponse,
    GetV2AccountsAccountIdError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}",
  })
}

/**
 * Update an Account
 * Update the information contained on an account.
 */
export const putV2AccountsAccountId = <ThrowOnError extends boolean = false>(
  options: Options<PutV2AccountsAccountIdData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    PutV2AccountsAccountIdResponse,
    PutV2AccountsAccountIdError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}",
  })
}

/**
 * Get all Account Members
 * Get all account members contained within your store.
 *
 * ### Filtering
 *
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) account members.
 *
 * | Attribute | Type | Operator | Example |
 * | :--- | :--- | :--- | :--- |
 * | `email` | `string` | `eq` / `like` | `eq(email,ronswanson@example.com)` |
 * | `name` | `string` | `eq` / `like` | `like(name,*swan*)` |
 *
 */
export const getV2AccountMembers = <ThrowOnError extends boolean = false>(
  options?: Options<GetV2AccountMembersData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2AccountMembersResponse,
    GetV2AccountMembersError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/account-members",
  })
}

/**
 * Get an Account Member
 * Get an account member from your store
 */
export const getV2AccountMembersAccountMemberId = <
  ThrowOnError extends boolean = false,
>(
  options: Options<GetV2AccountMembersAccountMemberIdData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2AccountMembersAccountMemberIdResponse,
    GetV2AccountMembersAccountMemberIdError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/account-members/{accountMemberID}",
  })
}

/**
 * Get all Account Memberships
 * You can also use `include=account_member` to retrieve details about the account members associated with the account memberships. With this option, you can get more information about the account members such as name and email in a single request. For more information see [including resources](/guides/Getting-Started/includes).
 *
 * ### Filtering
 *
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) account memberships.
 *
 * | Operator | Description |
 * | :--- | :--- |
 * | `eq` | Checks whether the values of two operands are equal. If the values are equal, the condition is true. |
 * | `like` | Checks if the operand contains the specified string. You can use wildcard characters in operand. |
 *
 * | Attribute | Type | Operator | Example |
 * | :--- | :--- | :--- | :--- |
 * | `account_member_id` | `string` | `eq` / `like` | `eq(account_member_id,00000000-0000-1000-8000-0000000)` |
 */
export const getV2AccountsAccountIdAccountMemberships = <
  ThrowOnError extends boolean = false,
>(
  options: Options<GetV2AccountsAccountIdAccountMembershipsData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2AccountsAccountIdAccountMembershipsResponse,
    GetV2AccountsAccountIdAccountMembershipsError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}/account-memberships",
  })
}

/**
 * Create an Account Membership
 * :::caution
 *
 * You can only create up to 1000 account memberships in an account.
 *
 * :::
 *
 */
export const postV2AccountsAccountIdAccountMemberships = <
  ThrowOnError extends boolean = false,
>(
  options: Options<PostV2AccountsAccountIdAccountMembershipsData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    PostV2AccountsAccountIdAccountMembershipsResponse,
    PostV2AccountsAccountIdAccountMembershipsError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}/account-memberships",
  })
}

/**
 * Get a List of Account Memberships of Account Member
 * You can also use `include=account` to retrieve details about the accounts associated with the account memberships. For more information see [including resources](/guides/Getting-Started/includes).
 *
 * You can use pagination with this resource. For more information, see [pagination](/guides/Getting-Started/pagination).
 *
 * ### Filtering
 *
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) account memberships.
 *
 * | Operator | Description |
 * | :--- | :--- |
 * | `eq` | Checks whether the values of two operands are equal. If the values are equal, the condition is true. |
 * | `like` | Checks if the operand contains the specified string. You can use wildcard characters in operand. |
 *
 * | Attribute | Type | Operator | Example |
 * | :--- | :--- | :--- | :--- |
 * | `account_member_id` | `string` | `eq` / `like` | `eq(account_member_id,00000000-0000-1000-8000-0000000)` |
 *
 */
export const getV2AccountMembersAccountMemberIdAccountMemberships = <
  ThrowOnError extends boolean = false,
>(
  options: Options<
    GetV2AccountMembersAccountMemberIdAccountMembershipsData,
    ThrowOnError
  >,
) => {
  return (options?.client ?? client).get<
    GetV2AccountMembersAccountMemberIdAccountMembershipsResponse,
    GetV2AccountMembersAccountMemberIdAccountMembershipsError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/account-members/{accountMemberId}/account-memberships",
  })
}

/**
 * Get a List of Unassigned Account Members
 * Use this resource to get a list of all account members that are not assigned to an account.
 *
 * ### Filtering
 *
 * The following operators and attributes are available for [filtering](/guides/Getting-Started/filtering) unassigned account members.
 *
 * | Operator | Description   |
 * | :------- | :--------------------------------------------------------------------------------------------------- |
 * | `eq`     | Checks whether the values of two operands are equal. If the values are equal, the condition is true. |
 * | `like`   | Checks if the operand contains the specified string. You can use wildcard characters in operand.     |
 *
 * The following attributes are available for [filtering](/guides/Getting-Started/filtering) unassigned account members.
 *
 * | Attribute | Type     | Operator      | Example                            |
 * | :-------- | :------- | :------------ | :--------------------------------- |
 * | `email`   | `string` | `eq` / `like` | `eq(email,ronswanson@example.com)` |
 * | `name`    | `string` | `eq` / `like` | `like(name,*swan*)`                |
 *
 * :::note
 *
 * You can use pagination with this resource. For more information, see [pagination](/guides/Getting-Started/pagination).
 *
 * :::
 */
export const getV2AccountsAccountIdAccountMembershipsUnassignedAccountMembers =
  <ThrowOnError extends boolean = false>(
    options: Options<
      GetV2AccountsAccountIdAccountMembershipsUnassignedAccountMembersData,
      ThrowOnError
    >,
  ) => {
    return (options?.client ?? client).get<
      GetV2AccountsAccountIdAccountMembershipsUnassignedAccountMembersResponse,
      GetV2AccountsAccountIdAccountMembershipsUnassignedAccountMembersError,
      ThrowOnError
    >({
      ...options,
      security: [
        {
          scheme: "bearer",
          type: "http",
        },
      ],
      url: "/v2/accounts/{accountID}/account-memberships/unassigned-account-members",
    })
  }

/**
 * Delete an Account Membership
 * Delete a membership from an account
 */
export const deleteV2AccountsAccountIdAccountMembershipsMembershipId = <
  ThrowOnError extends boolean = false,
>(
  options: Options<
    DeleteV2AccountsAccountIdAccountMembershipsMembershipIdData,
    ThrowOnError
  >,
) => {
  return (options?.client ?? client).delete<
    DeleteV2AccountsAccountIdAccountMembershipsMembershipIdResponse,
    DeleteV2AccountsAccountIdAccountMembershipsMembershipIdError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}/account-memberships/{membershipID}",
  })
}

/**
 * Get an Account Membership
 * Get an account membership from an account in your store.
 *
 * You can also use `include=account_member` to retrieve details about the account member associated with this account membership. With this option, you can get more information about the account member such as name and email in a single request. For more information see [including resources](/guides/Getting-Started/includes).
 *
 */
export const getV2AccountsAccountIdAccountMembershipsMembershipId = <
  ThrowOnError extends boolean = false,
>(
  options: Options<
    GetV2AccountsAccountIdAccountMembershipsMembershipIdData,
    ThrowOnError
  >,
) => {
  return (options?.client ?? client).get<
    GetV2AccountsAccountIdAccountMembershipsMembershipIdResponse,
    GetV2AccountsAccountIdAccountMembershipsMembershipIdError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}/account-memberships/{membershipID}",
  })
}

/**
 * Update an Account Membership
 * You can update and extend an account member details using [core flows](/docs/api/flows/flows#extend-an-existing-resource). However, you cannot update the `account_member_id` of an account member.
 */
export const putV2AccountsAccountIdAccountMembershipsMembershipId = <
  ThrowOnError extends boolean = false,
>(
  options: Options<
    PutV2AccountsAccountIdAccountMembershipsMembershipIdData,
    ThrowOnError
  >,
) => {
  return (options?.client ?? client).put<
    PutV2AccountsAccountIdAccountMembershipsMembershipIdResponse,
    PutV2AccountsAccountIdAccountMembershipsMembershipIdError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/accounts/{accountID}/account-memberships/{membershipID}",
  })
}

/**
 * Get Account Membership Settings
 * Use this endpoint to get all account membership settings.
 */
export const getV2SettingsAccountMembership = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<GetV2SettingsAccountMembershipData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2SettingsAccountMembershipResponse,
    GetV2SettingsAccountMembershipError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/account-membership",
  })
}

/**
 * Update Account Membership Settings
 * Use this endpoint to update account membership settings.
 */
export const putV2SettingsAccountMembership = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<PutV2SettingsAccountMembershipData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    PutV2SettingsAccountMembershipResponse,
    PutV2SettingsAccountMembershipError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/account-membership",
  })
}

/**
 * Get Account Authentication Settings
 * Use this endpoint to view account authentication settings
 */
export const getV2SettingsAccountAuthentication = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<GetV2SettingsAccountAuthenticationData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetV2SettingsAccountAuthenticationResponse,
    GetV2SettingsAccountAuthenticationError,
    ThrowOnError
  >({
    ...options,
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/account-authentication",
  })
}

/**
 * Update Account Authentication Settings
 * Use this endpoint to update account authentication settings
 */
export const putV2SettingsAccountAuthentication = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<PutV2SettingsAccountAuthenticationData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    PutV2SettingsAccountAuthenticationResponse,
    PutV2SettingsAccountAuthenticationError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/settings/account-authentication",
  })
}

/**
 * Generate an Account Management Authentication Token
 * Commerce provides authentication tokens for anyone using the Account Management APIs, including accounts and account members.
 *
 * For each element in the list returned by the account member authentication API, a token value is returned. In order for a shopper to authenticate as the account, this value should be set as the `EP-Account-Management-Authentication-Token` header when calling Commerce. This header grants access to additional resources associated with the account, such as [carts](/docs/api/carts/account-cart-associations), [orders](/docs/api/carts/orders), [catalogs with associated rules](/docs/api/pxm/catalog/rules), and [addresses](/docs/api/addresses/addresses-introduction).
 *
 * The set of permissions available to a shopper using an Account Management Authentication token is documented in [Permissions](/docs/authentication/Tokens/permissions)
 *
 * Commerce provides authentication tokens for an account and an account member using:
 *
 * - OpenID Connect
 * - Username and password
 * - Self signup
 * - One-time password token
 * - Switch account token
 *
 */
export const postV2AccountMembersTokens = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<PostV2AccountMembersTokensData, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    PostV2AccountMembersTokensResponse,
    PostV2AccountMembersTokensError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v2/account-members/tokens",
  })
}
