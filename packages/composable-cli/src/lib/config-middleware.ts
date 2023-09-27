import yargs, { MiddlewareFunction } from "yargs"
import { CommandContext } from "../types/command"
import { promises } from "node:fs"
import { composableRcSchema } from "./composable-rc-schema"
import findUp from "find-up"
import path from "path"

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
        return
      }

      const config = JSON.parse(
        await promises.readFile(configPath, "utf8"),
      ) as unknown
      const parsedConfig = composableRcSchema.safeParse(config)

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

function processUnknownError(error: unknown): string {
  let errorMessage = "An unknown error occurred"

  if (error instanceof Error) {
    if (error.message) {
      errorMessage += `: ${error.message}`
    }

    if (error.stack) {
      errorMessage += `\nStack Trace:\n${error.stack}`
    }
  }

  return errorMessage
}
