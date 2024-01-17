import { Listr } from "listr2"
import { D2CSetupTaskContext } from "./types"
import { setupAccountsTask } from "./setup-accounts"
import { createInitialCommit } from "../../utils/git-commit"

export function createD2CSetupTask() {
  return new Listr<D2CSetupTaskContext>([
    {
      title: "Initialize Git",
      task: async (ctx) => {
        if (!ctx.skipGit) {
          await createInitialCommit(ctx.workspaceRoot)
        }
      },
    },
    {
      title: "Setup accounts",
      task: setupAccountsTask,
    },
  ])
}
