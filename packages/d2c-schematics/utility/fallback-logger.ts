import { logging } from "@angular-devkit/core"
import { JsonObject } from "@angular-devkit/core/src/json/utils"
import { Logger, LogLevel } from "@angular-devkit/core/src/logger/logger"

export function createFallbackLogger(): logging.LoggerApi {
  return {
    createChild(name: string): Logger {
      return new Logger(name)
    },
    log: (level: LogLevel, message: string, metadata?: JsonObject) => {
      console.log(formatLog(level, message, metadata))
    },
    debug: (message: string, metadata?: JsonObject) => {
      console.debug(formatLog("debug", message, metadata))
    },
    info: (message: string, metadata?: JsonObject) => {
      console.info(formatLog("info", message, metadata))
    },
    warn: (message: string, metadata?: JsonObject) => {
      console.warn(formatLog("warn", message, metadata))
    },
    error: (message: string, metadata?: JsonObject) => {
      console.error(formatLog("error", message, metadata))
    },
    fatal: (message: string, metadata?: JsonObject) => {
      console.error(formatLog("fatal", message, metadata))
    },
  }
}

function formatLog(
  level: LogLevel,
  message: string,
  metadata?: JsonObject
): string {
  return `[${level}] ${message}${metadata && ` ${JSON.stringify(metadata)}`}`
}
