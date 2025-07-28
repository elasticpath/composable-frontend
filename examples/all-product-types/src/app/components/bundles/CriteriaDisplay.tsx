import type { JSX } from "react"

interface CriteriaDisplayProps {
  min?: number | null | undefined
  max?: number | null | undefined
  currentCount?: number
}

export function CriteriaDisplay({
  min,
  max,
  currentCount = 0,
}: CriteriaDisplayProps): JSX.Element | null {
  // Check if component is optional
  const isOptional = !min || min === 0

  // Format the criteria text
  let criteriaText = ""
  if (isOptional && !max) {
    criteriaText = "Optional"
  } else if (isOptional && max) {
    criteriaText = `Optional - Select up to ${max} item${max !== 1 ? "s" : ""}`
  } else if (min && max) {
    if (min === max) {
      criteriaText = `Select exactly ${min} item${min !== 1 ? "s" : ""}`
    } else {
      criteriaText = `Select ${min}-${max} items`
    }
  } else if (min) {
    criteriaText = `Select at least ${min} item${min !== 1 ? "s" : ""}`
  }

  // Format the status text when current count is provided
  let statusText = ""
  let statusColor = "text-gray-500"
  
  if (currentCount > 0 || isOptional) {
    if (!isOptional && min && currentCount < min) {
      const remaining = min - currentCount
      statusText = ` (${remaining} more required)`
      statusColor = "text-amber-600"
    } else if (max && currentCount === max) {
      statusText = " (maximum reached)"
      statusColor = "text-blue-600"
    } else if (currentCount > 0) {
      if (max && currentCount < max) {
        const remaining = max - currentCount
        statusText = ` (${currentCount} selected, ${remaining} more allowed)`
      } else {
        statusText = ` (${currentCount} selected)`
      }
      statusColor = isOptional ? "text-gray-500" : "text-green-600"
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={isOptional ? "text-gray-500" : "text-gray-600"}>
        {criteriaText}
      </span>
      {statusText && (
        <span className={`font-medium ${statusColor}`}>{statusText}</span>
      )}
    </div>
  )
}