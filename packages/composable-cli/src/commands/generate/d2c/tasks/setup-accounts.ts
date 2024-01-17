import { ListrTaskWrapper } from "listr2"
import { ListrRendererFactory } from "listr2/dist"
import { updateSettings } from "../../../setup/self-signup/util/update-settings"
import { processUnknownError } from "../../../../util/process-unknown-error"
import { createSelfSignupPasswordProfile } from "../../../setup/self-signup/util/create-self-signup-password-profile"
import { Moltin } from "@moltin/sdk"
import { addToEnvFile } from "../../../../lib/devkit/add-env-variables"

export type SetupAccountTaskContext = {
  client: Moltin
  workspaceRoot: string
}

export async function setupAccountsTask<
  TContext extends SetupAccountTaskContext,
>(
  _ctx: TContext,
  task: ListrTaskWrapper<TContext, ListrRendererFactory, ListrRendererFactory>,
) {
  /**
   * Setup accounts in store
   */
  return task.newListr(
    [
      {
        title: "Update account authentication settings",
        task: async (ctx) => {
          const updateResult = await updateSettings(ctx.client)

          if (!updateResult.success) {
            throw Error(
              `Updating account authentication settings failed - ${processUnknownError(
                updateResult,
              )}`,
            )
          }
        },
      },
      {
        title: "Create password profile",
        task: async (ctx, parentTask) => {
          const accountAuthSettings =
            await ctx.client.AccountAuthenticationSettings.Get()

          const realmId =
            accountAuthSettings.data.relationships.authentication_realm.data.id

          const profileCreationResult = await createSelfSignupPasswordProfile(
            ctx.client,
            realmId,
          )

          if (!profileCreationResult.success) {
            throw Error(
              `Failed to create password profile - ${processUnknownError(
                profileCreationResult,
              )}`,
            )
          }

          return parentTask.newListr({
            title: "File system changes",
            task: async () => {
              await addToEnvFile(ctx.workspaceRoot, ".env.local", {
                NEXT_PUBLIC_PASSWORD_PROFILE_ID: profileCreationResult.data.id,
                NEXT_PUBLIC_AUTHENTICATION_REALM_ID: realmId,
              })
            },
          })
        },
      },
    ],
    {
      concurrent: 2,
    },
  )
}
