import { Listr } from "listr2"
import { D2CSetupTaskContext } from "./types"
import { setupAccountsTask } from "./setup-accounts"

export function createD2CSetupTask() {
  return new Listr<D2CSetupTaskContext>([
    {
      title: "Setup accounts",
      task: setupAccountsTask,
    },
  ])
}
