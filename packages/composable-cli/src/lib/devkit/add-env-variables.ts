import { Rule, Tree } from "@angular-devkit/schematics"

export function addEnvVariables(
  envVars: Record<string, string>,
  path: string,
): Rule {
  return (host: Tree) => {
    const sourceText = host.readText(path)
    const envData = parseEnv(sourceText)

    const updatedEnvData = { ...envData, ...envVars }

    host.overwrite(path, stringifyEnvFile(updatedEnvData))

    return host
  }
}

export type EnvData = Record<string, string>

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
