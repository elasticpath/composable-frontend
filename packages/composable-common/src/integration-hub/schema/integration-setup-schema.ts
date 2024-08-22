import { z } from "zod"
import { errorCodes, klevuErrorCodes } from "../error-messages"

export const integrationSettingsBaseSchema = z.object({
  epccConfig: z.object({
    host: z.union([z.string(), z.literal("eu-west"), z.literal("us-east")]),
    clientId: z.string(),
    clientSecret: z.string(),
  }),
})

export const algoliaIntegrationSettingsSchema =
  integrationSettingsBaseSchema.merge(
    z.object({
      name: z.literal("algolia"),
      appId: z.string().min(1),
      adminApiKey: z.string().min(1),
    }),
  )

export type AlgoliaIntegrationSettings = z.TypeOf<
  typeof algoliaIntegrationSettingsSchema
>

export const klevuIntegrationSettingsSchema =
  integrationSettingsBaseSchema.merge(
    z.object({
      name: z.literal("klevu"),
      apiKey: z.string().min(1),
      searchUrl: z.string().min(1),
    }),
  )

export type KlevuIntegrationSettings = z.TypeOf<
  typeof klevuIntegrationSettingsSchema
>

export const integrationCreateConfigSchema = z.discriminatedUnion("name", [
  algoliaIntegrationSettingsSchema,
  klevuIntegrationSettingsSchema,
])

export type IntegrationCreateConfig = z.TypeOf<
  typeof integrationCreateConfigSchema
>

export const errorCodeSchema = z.enum(errorCodes)

export const integrationFailureResultBase = z.object({
  success: z.literal(false),
  reason: z.string(),
  error: z.instanceof(Error).optional(),
})

// Algolia results

export const algoliaIntegrationCreateSuccessResultSchema = z.object({
  success: z.literal(true),
  name: z.literal("algolia"),
  // TODO can look to refine the result further
  result: z.any(),
})

export const algoliaIntegrationCreateFailureResultSchema =
  integrationFailureResultBase.merge(
    z.object({
      name: z.literal("algolia"),
      code: errorCodeSchema,
    }),
  )

export type AlgoliaIntegrationCreateFailureResult = z.TypeOf<
  typeof algoliaIntegrationCreateFailureResultSchema
>

export const algoliaIntegrationCreateResultSchema = z.discriminatedUnion(
  "success",
  [
    algoliaIntegrationCreateSuccessResultSchema,
    algoliaIntegrationCreateFailureResultSchema,
  ],
)

export type AlgoliaIntegrationCreateResult = z.TypeOf<
  typeof algoliaIntegrationCreateResultSchema
>

// Klevu Results

export const klevuIntegrationCreateSuccessResultSchema = z.object({
  success: z.literal(true),
  name: z.literal("klevu"),
  // TODO can look to refine the result further
  result: z.any(),
})

export const klevuIntegrationCreateFailureResultSchema =
  integrationFailureResultBase.merge(
    z.object({
      name: z.literal("klevu"),
      code: z.enum(klevuErrorCodes),
    }),
  )

export type KlevIntegrationCreateFailureResult = z.TypeOf<
  typeof klevuIntegrationCreateFailureResultSchema
>

export const klevuIntegrationCreateResultSchema = z.discriminatedUnion(
  "success",
  [
    klevuIntegrationCreateSuccessResultSchema,
    klevuIntegrationCreateFailureResultSchema,
  ],
)

export type KlevuIntegrationCreateResult = z.TypeOf<
  typeof klevuIntegrationCreateResultSchema
>

export const integrationCreateResultSchema = z.union([
  algoliaIntegrationCreateResultSchema,
  klevuIntegrationCreateResultSchema,
])

export type IntegrationCreateResult = z.TypeOf<
  typeof integrationCreateResultSchema
>

export const integrationCreateFailureResult = z.discriminatedUnion("name", [
  algoliaIntegrationCreateFailureResultSchema,
  klevuIntegrationCreateFailureResultSchema,
])

export type IntegrationCreateFailureResult = z.TypeOf<
  typeof integrationCreateFailureResult
>
