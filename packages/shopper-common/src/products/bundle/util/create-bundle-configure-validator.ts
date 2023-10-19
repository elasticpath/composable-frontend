import {
  BundleComponents,
  BundleConfigurationSelectedOptions,
} from "../bundle.types"

interface ValidationEntryFailureResult {
  name: string
  success: false
  error: string
  check: "min" | "max"
}

interface ValidationEntrySuccessResult {
  name: string
  success: true
}

type ValidationEntryResult =
  | ValidationEntrySuccessResult
  | ValidationEntryFailureResult

type ValidationSuccessResult<T> = { success: true; result: T }
type ValidationFailureResult = {
  success: false
  errors: Omit<ValidationEntryFailureResult, "success">[]
}

type ValidationResult<T> = ValidationSuccessResult<T> | ValidationFailureResult

export const createBundleConfigureValidator = (
  bundleComponents: BundleComponents,
) => {
  return function validate(
    selectedOptions: BundleConfigurationSelectedOptions,
  ): ValidationResult<BundleConfigurationSelectedOptions> {
    const entryResults: ValidationEntryResult[] = Object.keys(
      bundleComponents,
    ).map((componentKey) => {
      const componentSelectedOptions = selectedOptions[componentKey] ?? {}

      const { min, max } = bundleComponents[componentKey]
      const result = validatePropertyCount(componentSelectedOptions, min, max)

      return { ...result, name: componentKey }
    })

    const failures = entryResults.filter(isEntryFailureResult)

    if (failures.length > 0) {
      return {
        success: false,
        errors: failures.map((failure) => {
          const { success, ...rest } = failure
          return rest
        }),
      }
    }

    return {
      success: true,
      result: selectedOptions,
    }
  }
}

function isEntryFailureResult(
  entryResult: ValidationEntryResult,
): entryResult is ValidationEntryFailureResult {
  return !entryResult.success
}

export function validatePropertyCount(
  obj: Record<string, any>,
  minValue?: number,
  maxValue?: number,
): ValidationEntryResult {
  const propertyCount = Object.keys(obj).length

  if (typeof minValue !== "undefined" && propertyCount < minValue) {
    return {
      success: false,
      check: "min",
      error: "Property count is less than the minimum value",
      name: "property-count",
    }
  }

  if (typeof maxValue !== "undefined" && propertyCount > maxValue) {
    return {
      success: false,
      check: "max",
      error: "Property count is greater than the maximum value",
      name: "property-count",
    }
  }

  return {
    success: true,
    name: "property-count",
  }
}
