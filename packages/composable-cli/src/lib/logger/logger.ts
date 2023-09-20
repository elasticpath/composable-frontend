const logger = console

type LoggerStatus =
  | "task"
  | "start"
  | "end"
  | "info"
  | "warn"
  | "error"
  | "debug"
const write = (
  status: LoggerStatus,
  text: string,
  data?: object,
  verbose = false
) => {
  let textToLog = ""

  if (status === "task") textToLog = "👍  "
  else if (status === "start") textToLog = "\n🔥  "
  else if (status === "end") textToLog = "\n✅  "
  else if (status === "info") textToLog = "ℹ️  "
  else if (status === "warn") textToLog = "🙀  "
  else if (status === "error") textToLog = "\n❌  "
  else if (status === "debug") textToLog = "🐞  "

  textToLog += text

  // Adds optional verbose output
  if (verbose) {
    textToLog += `\n${verbose}`
  }

  logger.log(textToLog)
  if (["start", "end", "error"].indexOf(status) > -1) {
    logger.log()
  }
  if (data) logger.dir(verbose, { depth: 15 })
}
// Printing any statements
export const log = (text: string) => {
  logger.log(text)
}

// Starting a process
export const start = (text: string) => {
  write("start", text)
}

// Ending a process
export const end = (text: string) => {
  write("end", text)
}

// Tasks within a process
export const task = (text: string) => {
  write("task", text)
}

// Info about a process task
export const info = (text: string) => {
  write("info", text)
}

// Verbose output
// takes optional data
export const debug = (text: string, data: any) => {
  write("debug", text, data)
}

// Warn output
export const warn = (text: string, data?: object) => {
  write("warn", text, data)
}

// Error output
// takes an optional error
export const error = (text: string, err?: Error) => {
  write("error", text, err)
}
