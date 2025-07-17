interface StepIndicatorProps {
  currentStep: "create" | "payment" | "complete"
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: "create", label: "Create Order", number: 1 },
    { id: "payment", label: "Process Payment", number: 2 },
    { id: "complete", label: "Order Complete", number: 3 },
  ]

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId)
    const currentIndex = steps.findIndex((s) => s.id === currentStep)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  const getStepClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "current":
        return "text-blue-600"
      default:
        return "text-gray-400"
    }
  }

  const getCircleClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-600 bg-green-100"
      case "current":
        return "border-blue-600 bg-blue-100"
      default:
        return "border-gray-300"
    }
  }

  const getConnectorClasses = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId)
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    return stepIndex < currentIndex ? "bg-green-600" : "bg-gray-300"
  }

  return (
    <div className="flex items-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center space-x-2 ${getStepClasses(
              getStepStatus(step.id),
            )}`}
          >
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getCircleClasses(
                getStepStatus(step.id),
              )}`}
            >
              {step.number}
            </div>
            <span className="font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ml-4 ${getConnectorClasses(step.id)}`} />
          )}
        </div>
      ))}
    </div>
  )
}
