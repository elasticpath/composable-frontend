import { RootCommandArguments } from "../../types/command"

export type InsightsCommandData = {}

export type InsightsCommandError = {
  code: string
  message: string
}

export type InsightsCommandArguments = {
  "opt-in"?: boolean
  optIn?: boolean
} & RootCommandArguments
