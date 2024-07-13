import { Alert, AlertProps } from "./components/Alert.js"
import { renderOnce } from "../ui"
import {
  consoleError,
  consoleLog,
  consoleWarn,
  Logger,
  LogLevel,
} from "../output"
import { recordUIEvent } from "../demo-recorder"
import React from "react"
import { RenderOptions } from "ink"
import { WelcomeNote } from "./login/welcome-note"

const typeToLogLevel: { [key in AlertProps["type"]]: LogLevel } = {
  info: "info",
  warning: "warn",
  success: "info",
  error: "error",
}

const typeToLogger: { [key in AlertProps["type"]]: Logger } = {
  info: consoleLog,
  warning: consoleWarn,
  success: consoleLog,
  error: consoleError,
}

export interface AlertOptions extends AlertProps {
  renderOptions?: RenderOptions
}

export function alert({
  type,
  headline,
  body,
  nextSteps,
  reference,
  link,
  customSections,
  orderedNextSteps = false,
  renderOptions,
}: AlertOptions) {
  // eslint-disable-next-line prefer-rest-params
  const { type: alertType, ...eventProps } = arguments[0]
  recordUIEvent({ type, properties: eventProps })

  return renderOnce(
    <Alert
      type={type}
      headline={headline}
      body={body}
      nextSteps={nextSteps}
      reference={reference}
      link={link}
      orderedNextSteps={orderedNextSteps}
      customSections={customSections}
    />,
    {
      logLevel: typeToLogLevel[type],
      logger: typeToLogger[type],
      renderOptions,
    },
  )
}

export interface WelcomeOptions extends AlertProps {
  renderOptions?: RenderOptions
}

export function welcomeNote({
  type,
  headline,
  body,
  nextSteps,
  reference,
  link,
  customSections,
  orderedNextSteps = false,
  renderOptions,
}: WelcomeOptions) {
  return renderOnce(
    <WelcomeNote
      type={type}
      headline={headline}
      body={body}
      nextSteps={nextSteps}
      reference={reference}
      link={link}
      orderedNextSteps={orderedNextSteps}
      customSections={customSections}
    />,
    {
      logLevel: typeToLogLevel[type],
      logger: typeToLogger[type],
      renderOptions,
    },
  )
}
