import yargs from "yargs"
import Conf from "conf"

export function createConfigCommand(store: Conf) {
  return function (
    argv: yargs.ArgumentsCamelCase<{ subcommand: "list" | undefined }>
  ) {
    if (argv.subcommand === "list") {
      return configListCommand(store)
    } else if (argv.subcommand === "clear") {
      return configClearCommand(store)
    } else {
      console.error("command not recognized")
    }
  }
}

export function configListCommand(store: Conf): void {
  console.log(store.store)
}

export function configClearCommand(store: Conf): void {
  store.clear()
}
