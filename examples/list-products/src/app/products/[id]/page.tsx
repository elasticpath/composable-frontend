import {
  client,
  AccessTokenResponse,
  getByContextProduct,
  extractProductImage,
} from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { CREDENTIALS_COOKIE_KEY } from "../../constants"
import { notFound } from "next/navigation"

client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
})

client.interceptors.request.use(async (request, options) => {
  const credentials = JSON.parse(
    (await cookies()).get(CREDENTIALS_COOKIE_KEY)?.value ?? "",
  ) as AccessTokenResponse | undefined
  request.headers.set("Authorization", `Bearer ${credentials?.access_token}`)
  return request
})

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const response = await getByContextProduct({
    path: { product_id: params.id },
    query: { include: ["main_image"] },
  })

  if (!response.data) {
    notFound()
  }

  const product = response.data.data!
  const mainImage = extractProductImage(
    product,
    response.data.included?.main_images || [],
  )
  const name = product.attributes?.name || "Unnamed Product"
  const description =
    product.attributes?.description || "No description available"
  const sku = product.attributes?.sku || "No SKU"
  const imageUrl = mainImage?.link?.href || "/placeholder.jpg"

  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50">
      <main className="max-w-5xl mx-auto bg-white p-6 rounded shadow-sm">
        <Link
          href="/"
          className="inline-block mb-6 text-blue-600 hover:underline"
        >
          &larr; Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative h-96 overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>

          <div>
            <h1 className="text-3xl font-semibold mb-2 text-black">{name}</h1>
            <p className="text-sm text-gray-500 mb-4">SKU: {sku}</p>

            <div className="mt-6">
              <h2 className="text-xl font-medium mb-2">Description</h2>
              <p className="text-black">{description}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
