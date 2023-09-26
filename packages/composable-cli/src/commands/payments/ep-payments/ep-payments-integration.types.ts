import { PaymentsCommandArguments } from "../payments.types"

export type EPPaymentsCommandData = {
  indexName?: string
}

export type EPPaymentsCommandError = {
  code: string
  message: string
}

export type EPPaymentsCommandArguments = {
  accountId?: string
  publishableKey?: string
} & PaymentsCommandArguments
