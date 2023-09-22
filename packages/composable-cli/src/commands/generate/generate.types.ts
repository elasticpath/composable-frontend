import { RootCommandArguments } from "../../types/command"

export type GenerateCommandData = {}

export type GenerateCommandError = {
  code: string
  message: string
}

export type GenerateCommandArguments = {
  schematic?: string
  debug: boolean | null
  "dry-run": boolean
  "allow-private"?: boolean
  force?: boolean
  "list-schematics"?: boolean
  "skip-install"?: boolean
  "skip-git"?: boolean
  "skip-config"?: boolean
} & RootCommandArguments
