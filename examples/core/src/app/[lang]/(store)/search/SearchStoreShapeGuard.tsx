import { postMultiSearch } from "@epcc-sdk/sdks-shopper"
import { redirect } from "next/navigation"
import { createElasticPathClient } from "src/lib/create-elastic-path-client"
import {
  createStoreShapeErrorPath,
  storeShapeProblemsFromSearchError,
  type StoreShapeProblem,
} from "src/lib/search-store-shape"
import { TAXONOMY_FACET_FIELD } from "src/lib/search-taxonomy-facet"

type Props = {
  lang: string
  returnPath: string
}

export async function SearchStoreShapeGuard({ lang, returnPath }: Props) {
  const problems = await findSearchStoreShapeProblems()

  if (problems.length > 0) {
    redirect(createStoreShapeErrorPath(lang, problems, returnPath))
  }

  return null
}

async function findSearchStoreShapeProblems(): Promise<StoreShapeProblem[]> {
  const probe = await postMultiSearch({
    client: createElasticPathClient(),
    body: {
      searches: [
        {
          type: "search",
          q: "*",
          per_page: 0,
          ...(TAXONOMY_FACET_FIELD ? { facet_by: TAXONOMY_FACET_FIELD } : {}),
        },
      ],
    },
  })

  return probe.error
    ? storeShapeProblemsFromSearchError(probe.error, TAXONOMY_FACET_FIELD)
    : []
}
