import {
  transports,
  createLogger,
  format,
  Logger as WinstonLogger,
} from "winston"
import type TransportStream from "winston-transport"

export type Logger = WinstonLogger

const loggerLevel = process.env.LOGGER_LEVELS

interface DataDogOptions {
  apiKey: string
  service: string
  source?: string
  host?: string
  ssl?: boolean
}

function createDataDogTransport({
  source = "netlify",
  host = "http-intake.logs.datadoghq.com",
  apiKey,
  service,
  ssl = true,
}: DataDogOptions): TransportStream {
  return new transports.Http({
    host,
    path: `/api/v2/logs?dd-api-key=${apiKey}&ddsource=${source}&service=${service}`,
    ssl,
    format: format.json(),
  })
}

export function initLogger(options?: { datadog?: DataDogOptions }): Logger {
  const level = loggerLevel ?? "info"
  console.log("logger level: ", loggerLevel, level)
  const logger = createLogger({
    level,
    format: format.combine(
      format.timestamp({
        format: "MMM DD, YYYY HH:mm Z",
      }),
      format.splat(),
      format.printf(
        (info) => `[${info.level}][${info.timestamp}]: ${info.message}`
      )
    ),
    transports: [
      new transports.Console({ level }),
      ...(options?.datadog ? [createDataDogTransport(options.datadog)] : []),
    ],
  })

  logger.debug(
    loggerLevel
      ? `Log level set to "${loggerLevel}" set LOGGER_LEVELS to change this.`
      : `Logger was missing env variable LOGGER_LEVELS so using default "info"`
  )

  return logger
}
