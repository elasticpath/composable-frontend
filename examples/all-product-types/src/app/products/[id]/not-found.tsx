import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50">
      <main className="max-w-5xl mx-auto bg-white p-6 rounded shadow-sm text-center">
        <h1 className="text-3xl font-semibold mb-4 text-black">
          Product Not Found
        </h1>
        <p className="text-black mb-6">
          The product you are looking for does not exist or is no longer
          available.
        </p>
        <Link href="/" className="inline-block text-blue-600 hover:underline">
          &larr; Back to products
        </Link>
      </main>
    </div>
  )
}
