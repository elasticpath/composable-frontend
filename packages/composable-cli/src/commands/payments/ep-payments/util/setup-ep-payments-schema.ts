import { z } from "zod"

export const epPaymentsSetupSchema = z.object({
  accountId: z.string(),
  publishableKey: z.string(),
})

export type EPPaymentsSetup = z.TypeOf<typeof epPaymentsSetupSchema>

export const epPaymentsForceSchema = z.object({
  force: z.boolean(),
})

export type EPPaymentsForce = z.TypeOf<typeof epPaymentsForceSchema>
