import { EmptyObj } from "../../types/empty-object"

export type StoreCommandData = {}

export type StoreCommandError = {
  code: string
  message: string
}

export type StoreCommandArguments = EmptyObj

export type SetStoreCommandData = EmptyObj
export type SetStoreCommandError = {
  code: string
  message: string
}

export type SetStoreCommandArguments = {
  id?: string
}
