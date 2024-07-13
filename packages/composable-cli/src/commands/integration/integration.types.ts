import { RootCommandArguments } from "../../types/command"

export type IntegrationCommandData = {}

export type IntegrationCommandError = {
  code: string
  message: string
}

export type IntegrationCommandArguments = RootCommandArguments
