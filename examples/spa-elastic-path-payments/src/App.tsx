import { useState } from "react"
import { type OrderResponse } from "@epcc-sdk/sdks-shopper"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { AppHeader } from "./components/AppHeader"
import { StepIndicator } from "./components/StepIndicator"
import { OrderCreator } from "./components/OrderCreator"
import { ElasticPathPayment } from "./components/ElasticPathPayment"
import { OrderStatus } from "./components/OrderStatus"
import { OrderCompleteView } from "./components/OrderCompleteView"
import { useAppInitialization } from "./hooks/useAppInitialization"
import { useOrderCreation } from "./hooks/useOrderCreation"

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  {
    stripeAccount: import.meta.env.VITE_STRIPE_ACCOUNT_ID || "",
  },
)

function App() {
  const [currentStep, setCurrentStep] = useState<
    "create" | "payment" | "complete"
  >("create")
  const [order, setOrder] = useState<OrderResponse | null>(null)

  const { isAuthenticated, cartId } = useAppInitialization()
  const { createIncompleteOrder, loading, error, clearError } =
    useOrderCreation()

  const handleCreateOrder = async () => {
    const newOrder = await createIncompleteOrder()
    if (newOrder) {
      setOrder(newOrder)
      setCurrentStep("payment")
    }
  }

  const handlePaymentComplete = (updatedOrder: OrderResponse) => {
    setOrder(updatedOrder)
    setCurrentStep("complete")
  }

  const resetFlow = () => {
    setOrder(null)
    setCurrentStep("create")
    clearError()
  }

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <AppHeader
          isAuthenticated={isAuthenticated}
          cartId={cartId}
          error={error}
        />

        <div className="space-y-6">
          <StepIndicator currentStep={currentStep} />

          {currentStep === "create" && (
            <OrderCreator
              onCreateOrder={handleCreateOrder}
              loading={loading}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentStep === "payment" && order && (
            <div className="space-y-6">
              <OrderStatus order={order} />
              <Elements
                stripe={stripePromise}
                options={{
                  mode: "payment",
                  currency:
                    order.meta?.display_price?.with_tax?.currency?.toLowerCase() ||
                    "usd",
                  amount: order.meta?.display_price?.with_tax?.amount || 100,
                  payment_method_types: ["card"],
                  appearance: {
                    theme: "stripe",
                  },
                }}
              >
                <ElasticPathPayment
                  order={order}
                  onPaymentComplete={handlePaymentComplete}
                  onError={clearError}
                />
              </Elements>
            </div>
          )}

          {currentStep === "complete" && order && (
            <div className="space-y-6">
              <OrderStatus order={order} />
              <OrderCompleteView onReset={resetFlow} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
