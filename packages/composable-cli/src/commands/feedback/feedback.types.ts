import { RootCommandArguments } from "../../types/command"

export type FeedbackCommandData = {}

export type FeedbackCommandError = {
  code: string
  message: string
}

export type FeedbackCommandArguments = RootCommandArguments
