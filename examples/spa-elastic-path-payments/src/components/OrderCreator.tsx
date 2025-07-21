import React from "react"

type Props = {
  onCreateOrder: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

export function OrderCreator({
  onCreateOrder,
  loading,
  isAuthenticated,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Step 1: Create Test Order
      </h2>

      <div className="space-y-4">
        <p className="text-gray-600">
          Create a sample order to demonstrate the Elastic Path payment process.
          Add to cart and checkout are handled for you this example. Refer to
          other examples in this repo for more information on how to add
          products to cart and initiate checkout.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            What happens when you create an order:
          </h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>
              Adds the first suitable and available product in your store to
              your cart
            </li>
            <li>
              Checks out the cart with placeholder customer data, thereby
              generating an incomplete order ready for payment processing
            </li>
          </ol>
        </div>

        {!isAuthenticated && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700 text-sm">
              ⚠️ Storefront not authenticated. Please check your environment
              variables configuration.
            </p>
          </div>
        )}

        <button
          onClick={onCreateOrder}
          disabled={loading || !isAuthenticated}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors duration-200"
        >
          {loading ? "Creating Order..." : "Create Test Order"}
        </button>
      </div>
    </div>
  )
}
