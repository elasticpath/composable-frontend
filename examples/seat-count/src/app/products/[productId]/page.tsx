import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SeatControl } from "@/components/seat-control"
import { fetchSeatProduct } from "@/lib/catalog"
import { selectSeats } from "@/lib/seat-rules"
import { envRequirementProblems } from "@/lib/store-requirements"

export const dynamic = "force-dynamic"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  if (envRequirementProblems(process.env).length > 0) {
    redirect("/configuration-error")
  }

  const { productId } = await params
  const lookup = await fetchSeatProduct(productId)

  if (lookup.status === "missing") notFound()
  if (lookup.status === "failed") redirect("/configuration-error")

  const { product } = lookup
  const unitPrice = selectSeats(product.seatRulesInput, 1).total

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-blue-600">
        ← All products
      </Link>

      <div>
        <h1 className="text-2xl font-medium">{product.name}</h1>
        <p className="text-xs text-gray-500">{product.sku}</p>
        {product.description ? (
          <p className="mt-3 text-sm text-gray-700">{product.description}</p>
        ) : null}
        <p className="mt-3 text-sm">
          {unitPrice ? `${unitPrice.formatted} per seat` : "No price"}
        </p>
      </div>

      <div className="rounded border border-gray-200 bg-white p-5">
        <SeatControl
          productId={product.id}
          product={product.seatRulesInput}
          contactUrl={process.env.CUSTOMER_SERVICE_URL!.trim()}
        />
      </div>
    </div>
  )
}
