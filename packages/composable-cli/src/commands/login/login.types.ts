import { RootCommandArguments } from "../../types/command"

export type LoginCommandData = {}

export type LoginCommandError = {
  code: string
  message: string
}

export type LoginCommandArguments = {
  username?: string
  password?: string
  region?: string
} & RootCommandArguments
