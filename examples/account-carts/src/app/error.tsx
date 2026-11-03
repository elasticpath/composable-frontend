"use client"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium">Elastic Path did not answer</h1>
      <p className="text-sm text-gray-600">
        Nothing was lost. Your cart is held by your account, not by this page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
      >
        Try again
      </button>
    </div>
  )
}
