import { GenerateCommandArguments } from "../generate.types"

export type D2CCommandData = {}

export type D2CCommandError = {
  code: string
  message: string
}

export type D2CCommandArguments = {
  location?: string
  "pkg-manager"?: "npm" | "yarn" | "pnpm" | "bun"
} & GenerateCommandArguments
