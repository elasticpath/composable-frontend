import { z } from "zod"

export const epPaymentGatewaySettingsSchema = z.object({
  epPaymentsStripeAccountId: z.string().min(1),
  epPaymentsStripePublishableKey: z.string().min(1),
})

export type EpPaymentGatewaySettings = z.TypeOf<
  typeof epPaymentGatewaySettingsSchema
>
