import React from "react"
import {
  collectLog,
  consoleError,
  consoleLog,
  Logger,
  LogLevel,
  outputWhereAppropriate,
} from "./output"
import { isUnitTest } from "./local"
import { ReactElement } from "react"
import { render as inkRender, RenderOptions } from "ink"
import EventEmitter from "events"
import { AlertProps, CustomSection } from "./ui/components/Alert"
import { alert } from "./ui/alert"
import { recordUIEvent } from "./demo-recorder"
import { FatalErrorType, FatalError as Fatal } from "./error"
import { FatalError } from "./ui/components/FatalError"

interface RenderOnceOptions {
  logLevel?: LogLevel
  logger?: Logger
  renderOptions?: RenderOptions
}

export function renderOnce(
  element: JSX.Element,
  { logLevel = "info", logger = consoleLog, renderOptions }: RenderOnceOptions,
) {
  const { output, unmount } = renderString(element, renderOptions)

  if (output) {
    outputWhereAppropriate(logLevel, logger, output, { skipUIEvent: true })
  }

  unmount()

  return output
}

interface Instance {
  output: string | undefined
  unmount: () => void
}

export class Stdout extends EventEmitter {
  columns: number
  rows: number
  readonly frames: string[] = []
  private _lastFrame?: string

  constructor(options: { columns?: number; rows?: number }) {
    super()
    this.columns = options.columns ?? 80
    this.rows = options.rows ?? 80
  }

  write = (frame: string) => {
    this.frames.push(frame)
    this._lastFrame = frame
  }

  lastFrame = () => {
    return this._lastFrame
  }
}

const renderString = (
  element: ReactElement,
  renderOptions?: RenderOptions,
): Instance => {
  const columns = isUnitTest() ? 80 : process.stdout.columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stdout = (renderOptions?.stdout as any) ?? new Stdout({ columns })

  const instance = inkRender(element, {
    stdout,
    debug: true,
    exitOnCtrlC: false,
    patchConsole: false,
  })

  return {
    output: stdout.lastFrame(),
    unmount: instance.unmount,
  }
}

export interface AlertOptions extends AlertProps {
  renderOptions?: RenderOptions
}

export type AlertCustomSection = CustomSection
export type RenderAlertOptions = Omit<AlertOptions, "type">

export function renderSuccess(options: RenderAlertOptions) {
  return alert({ ...options, type: "success" })
}

export function renderInfo(options: RenderAlertOptions) {
  return alert({ ...options, type: "info" })
}

export function renderError(options: RenderAlertOptions) {
  return alert({ ...options, type: "error" })
}

export function renderWarning(options: RenderAlertOptions) {
  return alert({ ...options, type: "warning" })
}

interface RenderTextOptions {
  text: string
  logLevel?: LogLevel
  logger?: Logger
}

/** Renders a text string to the console.
 * Using this function makes sure that correct spacing is applied among the various components.
 * @example
 * Hello world!
 *
 */
export function renderText({
  text,
  logLevel = "info",
  logger = consoleLog,
}: RenderTextOptions) {
  let textWithLineReturn = text
  if (!text.endsWith("\n")) textWithLineReturn += "\n"

  if (isUnitTest()) collectLog(logLevel, textWithLineReturn)
  outputWhereAppropriate(logLevel, logger, textWithLineReturn)
  return textWithLineReturn
}

interface RenderFatalErrorOptions {
  renderOptions?: RenderOptions
}

export function renderFatalError(
  error: Fatal,
  { renderOptions }: RenderFatalErrorOptions = {},
) {
  recordUIEvent({
    type: "fatalError",
    properties: {
      ...error,
      errorType: error.type === FatalErrorType.Bug ? "bug" : "abort",
    },
  })

  return renderOnce(<FatalError error={error} />, {
    logLevel: "error",
    logger: consoleError,
    renderOptions,
  })
}
