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
import { Metadata, ResolvingMetadata } from "next"

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

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Fetch product data
  const response = await getByContextProduct({
    path: { product_id: params.id },
    // @ts-ignore
    query: { include: ["main_image"] },
  })

  if (!response.data) {
    return {
      title: "Product Not Found",
    }
  }

  const product = response.data.data!
  const mainImage = extractProductImage(
    product,
    response.data.included?.main_images || [],
  )
  const name = product.attributes?.name || "Unnamed Product"
  const description =
    product.attributes?.description || "No description available"
  const imageUrl = mainImage?.link?.href || "/placeholder.jpg"

  return {
    title: name,
    description: description,
    openGraph: {
      title: name,
      description: description,
      images: [imageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const response = await getByContextProduct({
    path: { product_id: params.id },
    // @ts-ignore
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
  const price = product.attributes?.price?.amount || null
  const currency = product.attributes?.price?.currency || "USD"
  // Extract availability and brand if they exist in the product attributes
  const availability = "InStock" // Default value
  const brand = "" // Default empty value

  // Structured data for product (Schema.org)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    image: imageUrl,
    ...(price && {
      offers: {
        "@type": "Offer",
        price: typeof price === "object" ? JSON.stringify(price) : price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${params.id}`,
      },
    }),
    ...(brand && { brand: { "@type": "Brand", name: brand } }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
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

              {price && (
                <div className="mt-4">
                  <p className="text-xl font-semibold text-black">
                    {currency}{" "}
                    {typeof price === "object" ? JSON.stringify(price) : price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Availability: {availability}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h2 className="text-xl text-gray-600 font-medium mb-2">
                  Description
                </h2>
                <p className="text-gray-700">{description}</p>
              </div>

              {brand && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Brand: {brand}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
