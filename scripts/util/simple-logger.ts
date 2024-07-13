import chalk from "chalk"

export interface Logger {
  log: (msg: string, lineBefore?: boolean) => void
}

export function createLogger(): Logger {
  return {
    log: (msg, lineBefore = false) => {
      console.log(chalk.blue(lineBefore ? "\ni" : "i"), msg)
    },
  }
}
