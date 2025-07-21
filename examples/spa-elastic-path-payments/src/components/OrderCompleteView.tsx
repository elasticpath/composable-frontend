interface OrderCompleteViewProps {
  onReset: () => void
}

export function OrderCompleteView({ onReset }: OrderCompleteViewProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <div className="text-green-600 text-lg font-semibold mb-2">
        🎉 Payment Complete!
      </div>
      <p className="text-green-700 mb-4">
        The order has been marked as paid and is now complete.
      </p>
      <button
        onClick={onReset}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200"
      >
        Process Another Order
      </button>
    </div>
  )
}
