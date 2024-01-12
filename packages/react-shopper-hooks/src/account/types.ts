import { AccountTokenBase } from "@moltin/sdk"

export type AccountCredentials = {
  accountMemberId: string
  accounts: Record<string, AccountTokenBase>
  selected: string
}
