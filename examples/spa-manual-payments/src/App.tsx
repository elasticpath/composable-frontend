import { useState } from "react"
import { type OrderResponse } from "@epcc-sdk/sdks-shopper"
import { AppHeader } from "./components/AppHeader"
import { StepIndicator } from "./components/StepIndicator"
import { OrderCreator } from "./components/OrderCreator"
import { ManualPayment } from "./components/ManualPayment"
import { OrderStatus } from "./components/OrderStatus"
import { OrderCompleteView } from "./components/OrderCompleteView"
import { useAppInitialization } from "./hooks/useAppInitialization"
import { useOrderCreation } from "./hooks/useOrderCreation"

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
              <ManualPayment
                order={order}
                onPaymentComplete={handlePaymentComplete}
                onError={clearError}
              />
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
