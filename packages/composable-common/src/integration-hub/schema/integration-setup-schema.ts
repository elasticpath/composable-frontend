import { z } from "zod"
import { errorCodes } from "../error-messages"

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
  code: errorCodeSchema,
  reason: z.string(),
  error: z.instanceof(Error).optional(),
})

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

export const integrationCreateResultSchema =
  algoliaIntegrationCreateResultSchema

export type IntegrationCreateResult = z.TypeOf<
  typeof integrationCreateResultSchema
>
