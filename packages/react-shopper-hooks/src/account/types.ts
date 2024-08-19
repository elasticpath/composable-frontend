import { AccountTokenBase } from "@elasticpath/js-sdk"

export type AccountCredentials = {
  accountMemberId: string
  accounts: Record<string, AccountTokenBase>
  selected: string
}
