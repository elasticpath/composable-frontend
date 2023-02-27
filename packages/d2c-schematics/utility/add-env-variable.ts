import { Rule, Tree } from "@angular-devkit/schematics"
import { EnvData } from "../promotion-banner"

const ENV_FILE_PATH = "/.env.local"

export function parseEnv(src: string): EnvData {
  const result: EnvData = {}
  const lines = src.toString().split("\n")
  for (const line of lines) {
    const match = line.match(/^([^=:#]+?)[=:](.*)/)
    if (match) {
      const key = match[1].trim()
      result[key] = match[2].trim().replace(/['"]+/g, "")
    }
  }
  return result
}

function stringifyEnvFile(envData: EnvData): string {
  let result = ""
  for (const [key, value] of Object.entries(envData)) {
    if (key) {
      const line = `${key}=${String(value)}`
      result += line + "\n"
    }
  }
  return result
}

export function addEnvVariables(envVars: Record<string, string>): Rule {
  return (host: Tree) => {
    const sourceText = host.readText(ENV_FILE_PATH)
    const envData = parseEnv(sourceText)

    const updatedEnvData = { ...envData, ...envVars }

    host.overwrite(ENV_FILE_PATH, stringifyEnvFile(updatedEnvData))

    return host
  }
}
