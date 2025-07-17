import React from "react"
import type { OrderResponse } from "@epcc-sdk/sdks-shopper"

type Props = {
  order: OrderResponse
}

export function OrderStatus({ order }: Props) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "incomplete":
        return "text-orange-600 bg-orange-100"
      case "complete":
      case "paid":
        return "text-green-600 bg-green-100"
      case "processing":
      case "authorized":
        return "text-blue-600 bg-blue-100"
      case "cancelled":
      case "unpaid":
        return "text-red-600 bg-red-100"
      case "refunded":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-black mb-4">
        Order Information
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <div className="text-sm font-mono text-gray-700">{order.id}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.payment || "not specified",
              )}`}
            >
              {order.payment
                ? order.payment.charAt(0).toUpperCase() + order.payment.slice(1)
                : "Not specified"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.status || "unknown",
              )}`}
            >
              {order.status
                ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                : "Unknown"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <div className="text-lg font-semibold text-black">
              {order.meta?.display_price?.with_tax?.formatted || "Unknown"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
