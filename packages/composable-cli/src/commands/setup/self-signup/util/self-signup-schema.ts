import { z } from "zod"

export const selfSignupForceSchema = z.object({
  force: z.boolean(),
})

export type SelfSignupForce = z.TypeOf<typeof selfSignupForceSchema>
