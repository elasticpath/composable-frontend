import yargs, { MiddlewareFunction } from "yargs"
import { CommandContext } from "../types/command"
import { promises } from "node:fs"
import { composableRcSchema } from "./composable-rc-schema"
import findUp from "find-up"
import path from "path"
import { processUnknownError } from "../util/process-unknown-error"

export function createConfigMiddleware(
  ctx: CommandContext,
): MiddlewareFunction {
  return async function configMiddleware(
    _args: yargs.ArgumentsCamelCase<{ verbose?: boolean }>,
  ) {
    try {
      const configPath = await findUp([".composablerc"])

      if (!configPath) {
        ctx.logger.debug("No .composablerc file found")
        ctx.workspaceRoot = process.cwd()
        return
      }

      const parsedConfig = await retrieveComposableRcFile(configPath)

      if (!parsedConfig.success) {
        ctx.logger.warn(
          `Failed to parse .composablerc ${parsedConfig.error.message}`,
        )
        return
      }

      ctx.logger.debug(`Successfully read config ${path.basename(configPath)}`)
      ctx.composableRc = parsedConfig.data
      ctx.workspaceRoot = path.dirname(configPath)
    } catch (error) {
      ctx.logger.warn(
        "Error while attempting to read .composablerc use --verbose argument to see more details",
      )
      ctx.logger.debug(processUnknownError(error))
      return
    }
  }
}

export async function retrieveComposableRcFile(configPath: string) {
  const config = JSON.parse(
    await promises.readFile(configPath, "utf8"),
  ) as unknown
  return composableRcSchema.safeParse(config)
}
