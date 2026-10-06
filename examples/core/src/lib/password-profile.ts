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

export function requirePasswordProfileId(lang: string, from: string): string {
  const passwordProfileId = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID

  if (!passwordProfileId) {
    redirect(
      createMissingEnvironmentVariablePath(
        lang,
        [PASSWORD_PROFILE_ID_VARIABLE],
        from,
      ),
    )
  }

  return passwordProfileId
}

export async function requireExistingPasswordProfileId(
  lang: string,
  from: string,
): Promise<string> {
  const passwordProfileId = requirePasswordProfileId(lang, from)
  const problems = await findPasswordProfileStoreShapeProblems(passwordProfileId)

  if (problems.length > 0) {
    redirect(createStoreShapeErrorPath(lang, problems, from))
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
