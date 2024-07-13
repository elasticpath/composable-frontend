import { t } from "./server"
import { createIntegrationMutation } from "./procedures/create-integration-procedure"

export const appRouter = t.router({
  createIntegration: createIntegrationMutation,
})

export type AppRouter = typeof appRouter
