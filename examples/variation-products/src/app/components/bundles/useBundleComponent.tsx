"use client"

import { useCallback, useMemo } from "react"
import { ComponentProduct } from "@epcc-sdk/sdks-shopper"
import {
  useBundleProductComponents,
  useBundleSelectedOptions,
} from "./BundleProductProvider"
import { isChecked } from "./checked-utils"

export function useBundleComponent(componentKey: string): {
  selected: string[]
  component: ComponentProduct
  isSelectedOption: (optionId: string) => boolean
} {
  const selectedOptions = useBundleSelectedOptions()
  const components = useBundleProductComponents()
  const selected = useMemo(
    () => selectedOptions[componentKey]!,
    [selectedOptions, componentKey],
  )

  const component = useMemo(() => {
    return components[componentKey]!
  }, [components])

  const isSelectedOption = useCallback(createIsSelectedOption(selected), [
    selected,
  ])

  return {
    component,
    isSelectedOption,
    selected,
  }
}

export function createIsSelectedOption(selectedOptions: string[]) {
  return function _innerIsSelectedOption(optionId: string): boolean {
    return isChecked(selectedOptions, optionId)
  }
}