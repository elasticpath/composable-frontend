import type { Moltin } from "@moltin/sdk"

export type D2CSetupTaskContext = {
  client: Moltin
  workspaceRoot: string
  manualGatewaySetup?: boolean
  epPaymentGatewaySetup?: boolean
  accountId?: string
  publishableKey?: string
}
