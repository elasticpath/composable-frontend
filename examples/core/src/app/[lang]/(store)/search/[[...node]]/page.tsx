import { Search } from "../search"
import { Metadata } from "next"
import { Suspense } from "react"
import { SearchStoreShapeGuard } from "../SearchStoreShapeGuard"
import { searchReturnPath } from "src/lib/search-store-shape"

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products",
}

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ lang: string; node?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ params, searchParams }: Props) {
  const [{ lang, node }, query] = await Promise.all([params, searchParams])

  return (
    <>
      <Suspense fallback={null}>
        <SearchStoreShapeGuard
          lang={lang}
          returnPath={searchReturnPath(node, query)}
        />
      </Suspense>
      <Search />
    </>
  )
}
