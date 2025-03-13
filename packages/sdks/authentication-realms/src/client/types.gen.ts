// This file is auto-generated by @hey-api/openapi-ts

export type Type = "authentication_realm"

export type AuthenticationRealm = {
  id: string
  name: string
  type: "authentication_realm"
  meta: {
    created_at?: Date
    updated_at?: Date
  }
}

export type AuthenticationRealmResponse = {
  data: AuthenticationRealm
  links?: {
    self?: string
  }
}

export type AuthenticationRealmListResponse = {
  data: Array<AuthenticationRealm>
  links?: {
    self?: string
  }
}

export type AuthenticationRealmUpdateRequest = {
  data: {
    name: string
  }
}

export type OidcProfile = {
  id: string
  type: "openid_connect_profile"
  client_id: string
  client_secret?: string
  redirect_uris: Array<string>
  meta: {
    created_at?: Date
    updated_at?: Date
  }
}

export type OidcProfileResponse = {
  data: OidcProfile
  links?: {
    self?: string
  }
}

export type OidcProfileListResponse = {
  data: Array<OidcProfile>
  links?: {
    self?: string
  }
}

export type OidcProfileCreateRequestWrapper = {
  data: {
    type: "openid_connect_profile"
    client_id: string
    client_secret?: string
    redirect_uris: Array<string>
  }
}

export type OidcProfileUpdateRequestWrapper = {
  data: {
    id: string
    type: "openid_connect_profile"
    client_id: string
    client_secret?: string
    redirect_uris: Array<string>
  }
}

export type PasswordProfile = {
  id: string
  type: "password_profile"
  name: string
  description?: string
  meta: {
    created_at?: Date
    updated_at?: Date
  }
}

export type PasswordProfileResponse = {
  data: PasswordProfile
  links?: {
    self?: string
  }
}

export type PasswordProfileListResponse = {
  data: Array<PasswordProfile>
  links?: {
    self?: string
  }
}

export type PasswordProfileCreateRequestWrapper = {
  data: {
    type: "password_profile"
    name: string
    description?: string
  }
}

export type PasswordProfileUpdateRequestWrapper = {
  data: {
    id: string
    type: "password_profile"
    name: string
    description?: string
  }
}

export type OneTimePasswordTokenRequest = {
  username: string
  password: string
}

export type OneTimePasswordTokenResponse = {
  token: string
}

export type UserAuthenticationInfo = {
  id: string
  type: "user_authentication_info"
  username: string
  meta: {
    created_at?: Date
    updated_at?: Date
  }
}

export type UserAuthenticationInfoResponse = {
  data: UserAuthenticationInfo
  links?: {
    self?: string
  }
}

export type UserAuthenticationInfoListResponse = {
  data: Array<UserAuthenticationInfo>
  links?: {
    self?: string
  }
}

export type UserAuthenticationInfoCreateRequestWrapper = {
  data: {
    type: "user_authentication_info"
    username: string
  }
}

export type UserAuthenticationInfoUpdateRequestWrapper = {
  data: {
    id: string
    type: "user_authentication_info"
    username: string
  }
}

export type UserAuthenticationOidcProfileInfo = {
  id: string
  type: "user_authentication_oidc_profile_info"
  username: string
  meta: {
    created_at?: Date
    updated_at?: Date
  }
}

export type UserAuthenticationOidcProfileInfoResponse = {
  data: UserAuthenticationOidcProfileInfo
  links?: {
    self?: string
  }
}

export type UserAuthenticationOidcProfileInfoListResponse = {
  data: Array<UserAuthenticationOidcProfileInfo>
  links?: {
    self?: string
  }
}

export type UserAuthenticationOidcProfileInfoCreateRequestWrapper = {
  data: {
    type: "user_authentication_oidc_profile_info"
    username: string
  }
}

export type UserAuthenticationOidcProfileInfoUpdateRequestWrapper = {
  data: {
    id: string
    type: "user_authentication_oidc_profile_info"
    username: string
  }
}

export type PasswordProfileInfo = {
  /**
   * Unique identifier of the password profile info.
   */
  id: string
  username: string
  /**
   * Timestamps for creation and last update.
   */
  meta: {
    created_at?: Date
    updated_at?: Date
  }
  type: "user_authentication_password_profile_info"
  /**
   * Identifier for the associated password profile.
   */
  password_profile_id: string
}

export type PasswordProfileInfoResponse = {
  data: PasswordProfileInfo
  links?: {
    self?: string
  }
}

export type PasswordProfileInfoListResponse = {
  data: Array<PasswordProfileInfo>
  links?: {
    self?: string
  }
}

export type PasswordProfileInfoCreateRequestWrapper = {
  data: PasswordProfileInfoCreateRequest
}

export type PasswordProfileInfoCreateRequest = {
  type: "user_authentication_password_profile_info"
  username: string
  password: string
  password_profile_id: string
}

export type PasswordProfileInfoUpdateRequestWrapper = {
  data: PasswordProfileInfoUpdateRequest
}

export type PasswordProfileInfoUpdateRequest = {
  id: string
  type: "user_authentication_password_profile_info"
  username: string
  password: string
}

export type GetAllAuthenticationRealmsData = {
  body?: never
  path?: never
  query?: never
  url: "/v2/authentication-realms"
}

export type GetAllAuthenticationRealmsResponses = {
  /**
   * A list of authentication realms.
   */
  200: AuthenticationRealmListResponse
}

export type GetAllAuthenticationRealmsResponse =
  GetAllAuthenticationRealmsResponses[keyof GetAllAuthenticationRealmsResponses]

export type GetAuthenticationRealmData = {
  body?: never
  path: {
    /**
     * The identifier for the authentication realm.
     */
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}"
}

export type GetAuthenticationRealmErrors = {
  /**
   * Authentication realm not found.
   */
  404: unknown
}

export type GetAuthenticationRealmResponses = {
  /**
   * An authentication realm.
   */
  200: AuthenticationRealmResponse
}

export type GetAuthenticationRealmResponse =
  GetAuthenticationRealmResponses[keyof GetAuthenticationRealmResponses]

export type UpdateAuthenticationRealmData = {
  /**
   * The authentication realm data to update.
   */
  body: AuthenticationRealmUpdateRequest
  path: {
    /**
     * The identifier for the authentication realm.
     */
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}"
}

export type UpdateAuthenticationRealmErrors = {
  /**
   * Authentication realm not found.
   */
  404: unknown
}

export type UpdateAuthenticationRealmResponses = {
  /**
   * Updated authentication realm.
   */
  200: AuthenticationRealmResponse
}

export type UpdateAuthenticationRealmResponse =
  UpdateAuthenticationRealmResponses[keyof UpdateAuthenticationRealmResponses]

export type GetAllOidcProfilesData = {
  body?: never
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/openid-connect-profiles"
}

export type GetAllOidcProfilesResponses = {
  /**
   * A list of OpenID Connect profiles.
   */
  200: OidcProfileListResponse
}

export type GetAllOidcProfilesResponse =
  GetAllOidcProfilesResponses[keyof GetAllOidcProfilesResponses]

export type CreateOidcProfileData = {
  /**
   * The OpenID Connect profile to create.
   */
  body: OidcProfileCreateRequestWrapper
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/openid-connect-profiles"
}

export type CreateOidcProfileResponses = {
  /**
   * The created OpenID Connect profile.
   */
  201: OidcProfileResponse
}

export type CreateOidcProfileResponse =
  CreateOidcProfileResponses[keyof CreateOidcProfileResponses]

export type DeleteOidcProfileData = {
  body?: never
  path: {
    realmId: string
    oidcProfileId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/openid-connect-profiles/{oidcProfileId}"
}

export type DeleteOidcProfileErrors = {
  /**
   * OpenID Connect profile not found.
   */
  404: unknown
}

export type DeleteOidcProfileResponses = {
  /**
   * OpenID Connect profile deleted successfully.
   */
  204: void
}

export type DeleteOidcProfileResponse =
  DeleteOidcProfileResponses[keyof DeleteOidcProfileResponses]

export type GetOidcProfileData = {
  body?: never
  path: {
    realmId: string
    oidcProfileId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/openid-connect-profiles/{oidcProfileId}"
}

export type GetOidcProfileErrors = {
  /**
   * OpenID Connect profile not found.
   */
  404: unknown
}

export type GetOidcProfileResponses = {
  /**
   * An OpenID Connect profile.
   */
  200: OidcProfileResponse
}

export type GetOidcProfileResponse =
  GetOidcProfileResponses[keyof GetOidcProfileResponses]

export type UpdateOidcProfileData = {
  /**
   * The OpenID Connect profile to update.
   */
  body: OidcProfileUpdateRequestWrapper
  path: {
    realmId: string
    oidcProfileId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/openid-connect-profiles/{oidcProfileId}"
}

export type UpdateOidcProfileErrors = {
  /**
   * OpenID Connect profile not found.
   */
  404: unknown
}

export type UpdateOidcProfileResponses = {
  /**
   * Updated OpenID Connect profile.
   */
  200: OidcProfileResponse
}

export type UpdateOidcProfileResponse =
  UpdateOidcProfileResponses[keyof UpdateOidcProfileResponses]

export type GetAllPasswordProfilesData = {
  body?: never
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/password-profiles"
}

export type GetAllPasswordProfilesResponses = {
  /**
   * A list of password profiles.
   */
  200: PasswordProfileListResponse
}

export type GetAllPasswordProfilesResponse =
  GetAllPasswordProfilesResponses[keyof GetAllPasswordProfilesResponses]

export type CreatePasswordProfileData = {
  /**
   * The password profile to create.
   */
  body: PasswordProfileCreateRequestWrapper
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/password-profiles"
}

export type CreatePasswordProfileResponses = {
  /**
   * The created password profile.
   */
  201: PasswordProfileResponse
}

export type CreatePasswordProfileResponse =
  CreatePasswordProfileResponses[keyof CreatePasswordProfileResponses]

export type DeletePasswordProfileData = {
  body?: never
  path: {
    realmId: string
    passwordProfileId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}"
}

export type DeletePasswordProfileErrors = {
  /**
   * Password profile not found.
   */
  404: unknown
}

export type DeletePasswordProfileResponses = {
  /**
   * Password profile deleted successfully.
   */
  204: void
}

export type DeletePasswordProfileResponse =
  DeletePasswordProfileResponses[keyof DeletePasswordProfileResponses]

export type GetPasswordProfileData = {
  body?: never
  path: {
    realmId: string
    passwordProfileId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}"
}

export type GetPasswordProfileErrors = {
  /**
   * Password profile not found.
   */
  404: unknown
}

export type GetPasswordProfileResponses = {
  /**
   * A password profile.
   */
  200: PasswordProfileResponse
}

export type GetPasswordProfileResponse =
  GetPasswordProfileResponses[keyof GetPasswordProfileResponses]

export type UpdatePasswordProfileData = {
  /**
   * The password profile to update.
   */
  body: PasswordProfileUpdateRequestWrapper
  path: {
    realmId: string
    passwordProfileId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/password-profiles/{passwordProfileId}"
}

export type UpdatePasswordProfileErrors = {
  /**
   * Password profile not found.
   */
  404: unknown
}

export type UpdatePasswordProfileResponses = {
  /**
   * Updated password profile.
   */
  200: PasswordProfileResponse
}

export type UpdatePasswordProfileResponse =
  UpdatePasswordProfileResponses[keyof UpdatePasswordProfileResponses]

export type CreateOneTimePasswordTokenRequestData = {
  /**
   * Request body for one-time password token.
   */
  body: OneTimePasswordTokenRequest
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/password-profiles/one-time-password-token-request"
}

export type CreateOneTimePasswordTokenRequestResponses = {
  /**
   * One-time password token response.
   */
  200: OneTimePasswordTokenResponse
}

export type CreateOneTimePasswordTokenRequestResponse =
  CreateOneTimePasswordTokenRequestResponses[keyof CreateOneTimePasswordTokenRequestResponses]

export type GetAllUserAuthenticationInfoData = {
  body?: never
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info"
}

export type GetAllUserAuthenticationInfoResponses = {
  /**
   * A list of user authentication info objects.
   */
  200: UserAuthenticationInfoListResponse
}

export type GetAllUserAuthenticationInfoResponse =
  GetAllUserAuthenticationInfoResponses[keyof GetAllUserAuthenticationInfoResponses]

export type CreateUserAuthenticationInfoData = {
  /**
   * The user authentication info to create.
   */
  body: UserAuthenticationInfoCreateRequestWrapper
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info"
}

export type CreateUserAuthenticationInfoResponses = {
  /**
   * The created user authentication info.
   */
  201: UserAuthenticationInfoResponse
}

export type CreateUserAuthenticationInfoResponse =
  CreateUserAuthenticationInfoResponses[keyof CreateUserAuthenticationInfoResponses]

export type DeleteUserAuthenticationInfoData = {
  body?: never
  path: {
    realmId: string
    userAuthenticationInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}"
}

export type DeleteUserAuthenticationInfoErrors = {
  /**
   * User authentication info not found.
   */
  404: unknown
}

export type DeleteUserAuthenticationInfoResponses = {
  /**
   * User authentication info deleted successfully.
   */
  204: void
}

export type DeleteUserAuthenticationInfoResponse =
  DeleteUserAuthenticationInfoResponses[keyof DeleteUserAuthenticationInfoResponses]

export type GetUserAuthenticationInfoData = {
  body?: never
  path: {
    realmId: string
    userAuthenticationInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}"
}

export type GetUserAuthenticationInfoErrors = {
  /**
   * User authentication info not found.
   */
  404: unknown
}

export type GetUserAuthenticationInfoResponses = {
  /**
   * A user authentication info object.
   */
  200: UserAuthenticationInfoResponse
}

export type GetUserAuthenticationInfoResponse =
  GetUserAuthenticationInfoResponses[keyof GetUserAuthenticationInfoResponses]

export type UpdateUserAuthenticationInfoData = {
  /**
   * The user authentication info to update.
   */
  body: UserAuthenticationInfoUpdateRequestWrapper
  path: {
    realmId: string
    userAuthenticationInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}"
}

export type UpdateUserAuthenticationInfoErrors = {
  /**
   * User authentication info not found.
   */
  404: unknown
}

export type UpdateUserAuthenticationInfoResponses = {
  /**
   * Updated user authentication info.
   */
  200: UserAuthenticationInfoResponse
}

export type UpdateUserAuthenticationInfoResponse =
  UpdateUserAuthenticationInfoResponses[keyof UpdateUserAuthenticationInfoResponses]

export type GetAllUserAuthenticationOidcProfileInfoData = {
  body?: never
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info"
}

export type GetAllUserAuthenticationOidcProfileInfoResponses = {
  /**
   * A list of user authentication OIDC profile info objects.
   */
  200: UserAuthenticationOidcProfileInfoListResponse
}

export type GetAllUserAuthenticationOidcProfileInfoResponse =
  GetAllUserAuthenticationOidcProfileInfoResponses[keyof GetAllUserAuthenticationOidcProfileInfoResponses]

export type CreateUserAuthenticationOidcProfileInfoData = {
  /**
   * The OIDC profile info to create.
   */
  body: UserAuthenticationOidcProfileInfoCreateRequestWrapper
  path: {
    realmId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info"
}

export type CreateUserAuthenticationOidcProfileInfoResponses = {
  /**
   * The created user authentication OIDC profile info.
   */
  201: UserAuthenticationOidcProfileInfoResponse
}

export type CreateUserAuthenticationOidcProfileInfoResponse =
  CreateUserAuthenticationOidcProfileInfoResponses[keyof CreateUserAuthenticationOidcProfileInfoResponses]

export type DeleteUserAuthenticationOidcProfileInfoData = {
  body?: never
  path: {
    realmId: string
    userAuthenticationOidcProfileInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info/{userAuthenticationOidcProfileInfoId}"
}

export type DeleteUserAuthenticationOidcProfileInfoErrors = {
  /**
   * User authentication OIDC profile info not found.
   */
  404: unknown
}

export type DeleteUserAuthenticationOidcProfileInfoResponses = {
  /**
   * User authentication OIDC profile info deleted successfully.
   */
  204: void
}

export type DeleteUserAuthenticationOidcProfileInfoResponse =
  DeleteUserAuthenticationOidcProfileInfoResponses[keyof DeleteUserAuthenticationOidcProfileInfoResponses]

export type GetUserAuthenticationOidcProfileInfoData = {
  body?: never
  path: {
    realmId: string
    userAuthenticationOidcProfileInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info/{userAuthenticationOidcProfileInfoId}"
}

export type GetUserAuthenticationOidcProfileInfoErrors = {
  /**
   * User authentication OIDC profile info not found.
   */
  404: unknown
}

export type GetUserAuthenticationOidcProfileInfoResponses = {
  /**
   * A user authentication OIDC profile info object.
   */
  200: UserAuthenticationOidcProfileInfoResponse
}

export type GetUserAuthenticationOidcProfileInfoResponse =
  GetUserAuthenticationOidcProfileInfoResponses[keyof GetUserAuthenticationOidcProfileInfoResponses]

export type UpdateUserAuthenticationOidcProfileInfoData = {
  /**
   * The user authentication OIDC profile info to update.
   */
  body: UserAuthenticationOidcProfileInfoUpdateRequestWrapper
  path: {
    realmId: string
    userAuthenticationOidcProfileInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-openid-connect-profile-info/{userAuthenticationOidcProfileInfoId}"
}

export type UpdateUserAuthenticationOidcProfileInfoErrors = {
  /**
   * User authentication OIDC profile info not found.
   */
  404: unknown
}

export type UpdateUserAuthenticationOidcProfileInfoResponses = {
  /**
   * Updated user authentication OIDC profile info.
   */
  200: UserAuthenticationOidcProfileInfoResponse
}

export type UpdateUserAuthenticationOidcProfileInfoResponse =
  UpdateUserAuthenticationOidcProfileInfoResponses[keyof UpdateUserAuthenticationOidcProfileInfoResponses]

export type ListPasswordProfileInfosData = {
  body?: never
  path: {
    realmId: string
    userAuthenticationInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info"
}

export type ListPasswordProfileInfosResponses = {
  /**
   * A list of password profile info objects.
   */
  200: PasswordProfileInfoListResponse
}

export type ListPasswordProfileInfosResponse =
  ListPasswordProfileInfosResponses[keyof ListPasswordProfileInfosResponses]

export type CreatePasswordProfileInfoData = {
  /**
   * The password profile info to create.
   */
  body: PasswordProfileInfoCreateRequestWrapper
  path: {
    realmId: string
    userAuthenticationInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info"
}

export type CreatePasswordProfileInfoResponses = {
  /**
   * The created password profile info.
   */
  201: PasswordProfileInfoResponse
}

export type CreatePasswordProfileInfoResponse =
  CreatePasswordProfileInfoResponses[keyof CreatePasswordProfileInfoResponses]

export type DeletePasswordProfileInfoData = {
  body?: never
  path: {
    realmId: string
    userAuthenticationInfoId: string
    userAuthenticationPasswordProfileInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info/{userAuthenticationPasswordProfileInfoId}"
}

export type DeletePasswordProfileInfoErrors = {
  /**
   * Password profile info not found.
   */
  404: unknown
}

export type DeletePasswordProfileInfoResponses = {
  /**
   * Password profile info deleted successfully.
   */
  204: void
}

export type DeletePasswordProfileInfoResponse =
  DeletePasswordProfileInfoResponses[keyof DeletePasswordProfileInfoResponses]

export type GetPasswordProfileInfoData = {
  body?: never
  path: {
    realmId: string
    userAuthenticationInfoId: string
    userAuthenticationPasswordProfileInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info/{userAuthenticationPasswordProfileInfoId}"
}

export type GetPasswordProfileInfoErrors = {
  /**
   * Password profile info not found.
   */
  404: unknown
}

export type GetPasswordProfileInfoResponses = {
  /**
   * A password profile info object.
   */
  200: PasswordProfileInfoResponse
}

export type GetPasswordProfileInfoResponse =
  GetPasswordProfileInfoResponses[keyof GetPasswordProfileInfoResponses]

export type UpdatePasswordProfileInfoData = {
  /**
   * The updated password profile info.
   */
  body: PasswordProfileInfoUpdateRequestWrapper
  path: {
    realmId: string
    userAuthenticationInfoId: string
    userAuthenticationPasswordProfileInfoId: string
  }
  query?: never
  url: "/v2/authentication-realms/{realmId}/user-authentication-info/{userAuthenticationInfoId}/user-authentication-password-profile-info/{userAuthenticationPasswordProfileInfoId}"
}

export type UpdatePasswordProfileInfoErrors = {
  /**
   * Password profile info not found.
   */
  404: unknown
}

export type UpdatePasswordProfileInfoResponses = {
  /**
   * Updated password profile info.
   */
  200: PasswordProfileInfoResponse
}

export type UpdatePasswordProfileInfoResponse =
  UpdatePasswordProfileInfoResponses[keyof UpdatePasswordProfileInfoResponses]
