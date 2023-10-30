import {
  callRule,
  HostTree,
  Rule,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics"
import { commitTree, createScopedHost } from "./tree-util"
import { CommandContext } from "../../types/command"
import ora from "ora"
import { Result } from "../../types/results"

export async function addToEnvFile(
  workspaceRoot: string,
  filepath: string,
  variables: Record<string, string>,
): Promise<void> {
  const host = createScopedHost(workspaceRoot)

  const initialTree = new HostTree(host)

  if (!initialTree.exists(filepath)) {
    initialTree.create(filepath, "")
  }

  const context = {} as unknown as SchematicContext

  const rule = addEnvVariables(variables, filepath)

  const tree = await callRule(rule, initialTree, context).toPromise()

  if (!tree) {
    throw new Error("Tree is undefined after calling rule")
  }

  await commitTree(host, tree)
}

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

export async function attemptToAddEnvVariables(
  ctx: CommandContext,
  spinner: ora.Ora,
  variables: Record<string, string>,
): Promise<Result<{}, { code: string; message: string }>> {
  const { workspaceRoot, composableRc } = ctx

  if (!composableRc) {
    return {
      success: false,
      error: {
        code: "NO_COMPOSABLE_RC",
        message: "Could not detect workspace root - missing composable.rc file",
      },
    }
  }

  spinner.start(`Adding environment variables to .env.local file...`)

  if (!workspaceRoot) {
    spinner.fail(
      `Failed to add environment variables to .env.local file - missing workspace root`,
    )
    return {
      success: false,
      error: {
        code: "FAILED_TO_ADD_ENV_VARS",
        message: "Failed to add env variables to .env.local file",
      },
    }
  }
  await addToEnvFile(workspaceRoot, ".env.local", variables)

  spinner.succeed(`Added environment variables to .env.local file.`)

  return {
    success: true,
    data: {},
  }
}
