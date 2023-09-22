import { EmptyObj } from "../../types/empty-object"
import { RootCommandArguments } from "../../types/command"

export type StoreCommandData = {}

export type StoreCommandError = {
  code: string
  message: string
}

export type StoreCommandArguments = RootCommandArguments

export type SetStoreCommandData = EmptyObj
export type SetStoreCommandError = {
  code: string
  message: string
}

export type SetStoreCommandArguments = {
  id?: string
} & RootCommandArguments
