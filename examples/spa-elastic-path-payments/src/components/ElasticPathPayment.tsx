import React, { useState, useEffect } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import {
  paymentSetup,
  confirmPayment,
  type OrderResponse,
} from "@epcc-sdk/sdks-shopper"

type Props = {
  order: OrderResponse
  onPaymentComplete: (updatedOrder: OrderResponse) => void
  onError: (error: string) => void
}

export function ElasticPathPayment({
  order,
  onPaymentComplete,
  onError,
}: Props) {
  const [processing, setProcessing] = useState(false)

  const stripe = useStripe()
  const elements = useElements()

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError("Payment system not ready")
      return
    }

    try {
      setProcessing(true)
      onError("")

      // Step 1: Submit the payment form to validate
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      // Step 2: Setup payment with Elastic Path
      const paymentResponse = await paymentSetup({
        path: {
          orderID: order.id!,
        },
        body: {
          data: {
            gateway: "elastic_path_payments_stripe",
            method: "purchase",
            payment_method_types: ["card"],
          },
        },
      })

      if (paymentResponse.error) {
        console.error("Payment setup error:", paymentResponse.error)
        throw new Error(
          `Payment setup failed: ${JSON.stringify(paymentResponse.error)}`,
        )
      }

      if (!paymentResponse.data) {
        throw new Error("No payment data received")
      }

      const clientSecret = (paymentResponse.data as any)?.data?.payment_intent
        ?.client_secret
      const transactionId = (paymentResponse.data as any)?.data?.id

      if (!clientSecret) {
        console.error(
          "No client secret in response:",
          JSON.stringify(paymentResponse.data, null, 2),
        )
        throw new Error("No client secret received from payment setup")
      }

      // Step 3: Confirm payment with Stripe
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
          redirect: "if_required",
        })

      if (confirmError) {
        console.error("Stripe confirmation error:", confirmError)
        throw new Error(confirmError.message)
      }

      if (paymentIntent?.status === "succeeded") {
        // Step 4: Confirm with Elastic Path
        const confirmResponse = await confirmPayment({
          path: {
            orderID: order.id!,
            transactionID: transactionId,
          },
          body: {
            data: {
              options: {},
            },
          },
        })

        if (confirmResponse.error) {
          console.error("EP confirmation error:", confirmResponse.error)
          throw new Error("Failed to confirm order with Elastic Path")
        }

        // Payment successful
        const updatedOrder: OrderResponse = {
          ...order,
          status: "complete",
          payment: "paid",
        }

        onPaymentComplete(updatedOrder)
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent?.status}`)
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      onError(err?.message || "Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Step 2: Payment Details
      </h2>

      <div className="space-y-4">
        {/* Order Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Order Summary
          </h4>
          <div className="flex justify-between text-sm">
            <span>Order ID:</span>
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Amount:</span>
            <span className="font-semibold">
              {order.meta?.display_price?.with_tax?.formatted || "Unknown"}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        {!stripe && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">
              Loading payment system...
            </p>
          </div>
        )}

        {stripe && !elements && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">
              Initializing payment...
            </p>
          </div>
        )}

        {elements && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <PaymentElement />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors duration-200"
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </span>
              ) : (
                `Pay ${order.meta?.display_price?.with_tax?.formatted || "Now"}`
              )}
            </button>
          </form>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Payments are processed securely by Stripe</p>
          <p>Powered by Elastic Path Payments</p>
        </div>
      </div>
    </div>
  )
}
