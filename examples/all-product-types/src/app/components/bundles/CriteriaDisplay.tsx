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
  // Don't display anything if there are no criteria
  if (!min && !max) {
    return null
  }

  // Format the criteria text
  let criteriaText = ""
  if (min && max) {
    if (min === max) {
      criteriaText = `Select exactly ${min} item${min !== 1 ? "s" : ""}`
    } else {
      criteriaText = `Select ${min}-${max} items`
    }
  } else if (min) {
    criteriaText = `Select at least ${min} item${min !== 1 ? "s" : ""}`
  } else if (max) {
    criteriaText = `Select up to ${max} item${max !== 1 ? "s" : ""}`
  }

  // Format the status text when current count is provided
  let statusText = ""
  let statusColor = "text-gray-500"
  
  if (currentCount > 0) {
    if (min && currentCount < min) {
      const remaining = min - currentCount
      statusText = ` (${remaining} more required)`
      statusColor = "text-amber-600"
    } else if (max && currentCount === max) {
      statusText = " (maximum reached)"
      statusColor = "text-blue-600"
    } else if (max && currentCount < max) {
      const remaining = max - currentCount
      statusText = ` (${remaining} more allowed)`
      statusColor = "text-gray-500"
    } else {
      statusText = ` (${currentCount} selected)`
      statusColor = "text-green-600"
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">{criteriaText}</span>
      {statusText && (
        <span className={`font-medium ${statusColor}`}>{statusText}</span>
      )}
    </div>
  )
}