interface AppHeaderProps {
  isAuthenticated: boolean
  cartId: string | null
  error: string | null
}

export function AppHeader({ isAuthenticated, cartId, error }: AppHeaderProps) {
  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <h1 className="text-2xl font-semibold mb-2 text-gray-900">
        Elastic Path Payment Gateway Demo (SPA)
      </h1>
      <p className="text-black">
        Status:{" "}
        {isAuthenticated ? (
          <span className="font-semibold text-green-600">
            Storefront successfully authenticated
          </span>
        ) : (
          <span className="font-semibold text-red-600">
            Storefront not authenticated
          </span>
        )}
      </p>

      <div className="flex items-center mt-2 text-sm text-gray-600">
        Cart ID:{" "}
        <span className="font-mono text-xs ml-1">
          {cartId || "No cart initialized"}
        </span>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
