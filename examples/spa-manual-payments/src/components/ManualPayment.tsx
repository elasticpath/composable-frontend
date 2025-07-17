import React, { useState } from "react"
import { paymentSetup, type OrderResponse } from "@epcc-sdk/sdks-shopper"

type Props = {
  order: OrderResponse
  onPaymentComplete: (updatedOrder: OrderResponse) => void
  onError: (error: string) => void
}

export function ManualPayment({ order, onPaymentComplete, onError }: Props) {
  const [processing, setProcessing] = useState(false)
  const [paymentReference, setPaymentReference] = useState("")

  const processManualPayment = async () => {
    try {
      setProcessing(true)
      onError("")

      // Build paymentmethod_meta only if user provided a reference
      const paymentmethod_meta: { custom_reference?: string } = {}

      if (paymentReference.trim()) {
        paymentmethod_meta.custom_reference = paymentReference.trim()
      }

      // Process payment using Elastic Path manual payment gateway
      // In a real storefront, this would typically use "purchase" to immediately complete the payment
      if (!order.id) {
        throw new Error("Order ID is missing")
      }

      const paymentResponse = await paymentSetup({
        path: {
          orderID: order.id,
        },
        body: {
          data: {
            gateway: "manual",
            method: "purchase", // Always use purchase for immediate completion in real storefronts
            // Only include paymentmethod_meta if user provided a reference
            ...(Object.keys(paymentmethod_meta).length > 0 && {
              paymentmethod_meta,
            }),
          },
        },
      })

      if (paymentResponse.error) {
        throw new Error("Payment processing failed")
      }

      // Update order with only the fields that actually change after payment
      // Note: We can't fetch the updated order from API (requires elevated permissions in SPA),
      // so we update client-side based on documented Elastic Path payment behavior
      const updatedOrder: OrderResponse = {
        ...order,
        // After successful manual payment, order status changes to "complete"
        status: "complete",
        // Payment status changes to "paid" after successful payment processing
        payment: "paid",
      }

      onPaymentComplete(updatedOrder)
    } catch (err: any) {
      onError(err?.message || "Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Step 2: Take Payment
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Reference (Optional)
          </label>
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Transaction ID, Check Number, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={processing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Enter a reference number or identifier for this payment
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Order Summary
          </h4>
          <div className="flex justify-between text-sm">
            <span>Order ID:</span>
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Amount to Process:</span>
            <span className="font-semibold">
              {order.meta?.display_price?.with_tax?.formatted || "Unknown"}
            </span>
          </div>
        </div>

        <button
          onClick={processManualPayment}
          disabled={processing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors duration-200"
        >
          {processing ? "Recording Payment..." : "Mark Order as Paid"}
        </button>
      </div>
    </div>
  )
}
