import { z } from "zod"

export const epPaymentGatewaySettingsSchema = z.object({
  epccConfig: z.object({
    host: z.union([z.string(), z.literal("eu-west"), z.literal("us-east")]),
    clientId: z.string(),
    clientSecret: z.string(),
  }),
  gatewayName: z.literal("ep-payments"),
  epPaymentsStripeAccountId: z.string().min(1),
  epPaymentsStripePublishableKey: z.string().min(1),
})

export type EpPaymentGatewaySettings = z.TypeOf<
  typeof epPaymentGatewaySettingsSchema
>
