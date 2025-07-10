import React from "react"

export function Checkout({ onBack }: { onBack?: () => void }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center py-10">
      <h2 className="text-2xl font-semibold text-black mb-4">Checkout</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        This is a placeholder checkout form. In the next steps we will collect
        shipping details, billing information, and complete the order.
      </p>
      <form className="w-full max-w-sm space-y-4 bg-white p-6 border border-gray-200 rounded-md shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            disabled
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            disabled
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            disabled
            placeholder="123 Main St, City, Country"
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
          />
        </div>
        <button
          type="button"
          disabled
          className="w-full py-2 px-4 rounded bg-blue-500 text-white opacity-50 cursor-not-allowed"
        >
          Place Order
        </button>
      </form>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-blue-600 hover:underline"
        >
          &larr; Back to Cart
        </button>
      )}
    </div>
  )
}
