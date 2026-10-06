import { redirect } from "next/navigation"
import { createElasticPathClient } from "src/lib/create-elastic-path-client"
import { createMissingEnvironmentVariablePath } from "src/lib/middleware/create-missing-environment-variable-url"
import {
  createStoreShapeErrorPath,
  storeShapeProblemsFromPasswordProfileError,
  type StoreShapeProblem,
} from "src/lib/search-store-shape"

const PASSWORD_PROFILE_ID_VARIABLE = "NEXT_PUBLIC_PASSWORD_PROFILE_ID"

type AccountAuthenticationSettings = {
  data?: {
    relationships?: {
      authentication_realm?: { data?: { id?: string } }
    }
  }
}

export function requirePasswordProfileIdSet(lang: string, returnPath: string): string {
  const passwordProfileId = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID

  if (!passwordProfileId) {
    redirect(
      createMissingEnvironmentVariablePath(
        lang,
        [PASSWORD_PROFILE_ID_VARIABLE],
        returnPath,
      ),
    )
  }

  return passwordProfileId
}

export async function requirePasswordProfileIdInStore(
  lang: string,
  returnPath: string,
): Promise<string> {
  const passwordProfileId = requirePasswordProfileIdSet(lang, returnPath)
  const problems = await findPasswordProfileStoreShapeProblems(passwordProfileId)

  if (problems.length > 0) {
    redirect(createStoreShapeErrorPath(lang, problems, returnPath))
  }

  return passwordProfileId
}

async function findPasswordProfileStoreShapeProblems(
  passwordProfileId: string,
): Promise<StoreShapeProblem[]> {
  const client = createElasticPathClient()

  const settings = await client.get<{ 200: AccountAuthenticationSettings }, unknown>({
    url: "/v2/settings/account-authentication",
  })
  const realmId =
    settings.data?.data?.relationships?.authentication_realm?.data?.id

  if (settings.error || !realmId) {
    return []
  }

  const passwordProfile = await client.get<{ 200: unknown }, unknown>({
    url: `/v2/authentication-realms/${encodeURIComponent(realmId)}/password-profiles/${encodeURIComponent(passwordProfileId)}`,
  })

  return passwordProfile.error
    ? storeShapeProblemsFromPasswordProfileError(passwordProfile.error)
    : []
}
