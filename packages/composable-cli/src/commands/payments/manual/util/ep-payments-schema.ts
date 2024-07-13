import { z } from "zod"

export const manualGatewaySettingsSchema = z.object({
  epPaymentsStripeAccountId: z.string().min(1),
  epPaymentsStripePublishableKey: z.string().min(1),
})

export type ManualGatewaySettings = z.TypeOf<typeof manualGatewaySettingsSchema>
