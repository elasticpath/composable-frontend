export type GenerateCommandData = {}

export type GenerateCommandError = {
  code: string
  message: string
}

export type GenerateCommandArguments = {
  schematic?: string
  name: string | null
  interactive: boolean
  debug: boolean | null
  "dry-run": boolean
  "allow-private"?: boolean
  force?: boolean
  "list-schematics"?: boolean
  verbose?: boolean
  "skip-install"?: boolean
  "skip-git"?: boolean
  "skip-config"?: boolean
}
