import yargs from "yargs"
import Conf from "conf"
import inquirer from "inquirer"
import { resolveHostFromRegion } from "../util/resolve-region"
import { buildStorePrompts, switchUserStore } from "../util/build-store-prompts"

export function createStoreCommand(store: Conf) {
  return async function storeCommand(
    argv: yargs.ArgumentsCamelCase<{ subcommand: "set" | undefined }>
  ) {
    if (argv.subcommand === "set") {
      return storeSelectCommand(store)
    } else {
      console.error("command not recognized")
    }
  }
}

export async function storeSelectCommand(store: Conf) {
  const apiUrl = resolveHostFromRegion(store.get("region") as any)
  const token = store.get("credentials.access_token") as any

  const choices = await buildStorePrompts(apiUrl, token)

  const answers = await inquirer.prompt([
    {
      type: "list",
      loop: false,
      name: "store",
      message: "What store?",
      choices,
    },
  ])

  await switchUserStore(apiUrl, token, answers.store.id)
  store.set("store", answers.store)
}
