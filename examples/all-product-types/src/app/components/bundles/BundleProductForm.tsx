"use client"
import {
  ProductData,
  StockLocations,
} from "@epcc-sdk/sdks-shopper"
import { ReactNode, useMemo, useEffect, useRef } from "react"
import { useForm, useWatch, useFormContext } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "../form/Form"
import { createBundleFormSchema } from "./validation-schema"
import { selectedOptionsToFormValues, formSelectedOptionsToData, FormSelectedOptions } from "./form-parsers"
import { addToBundleAction } from "../../products/[id]/actions/cart-actions"
import { useShopperProductContext } from "../useShopperProductContext"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function BundleProductForm({
  product,
  locations,
  children,
}: {
  product: ProductData
  locations?: StockLocations
  children: ReactNode
}) {
  const validationSchema = useMemo(
    () => createBundleFormSchema(product.data?.attributes?.components ?? {}),
    [product],
  )

  if (!product.data?.meta?.bundle_configuration?.selected_options) {
    throw new Error("Bundle product must provide selected options")
  }

  const form = useForm<z.infer<typeof validationSchema>>({
    defaultValues: {
      productId: product.data.id,
      selectedOptions: selectedOptionsToFormValues(
        product.data.meta.bundle_configuration.selected_options,
      ),
      quantity: 1,
      location: locations ? Object.keys(locations)[0] : "",
    },
    resolver: zodResolver(validationSchema),
  })

  async function handleSubmit(data: z.infer<typeof validationSchema>) {
    try {
      const result = await addToBundleAction(data)
      if (result.error) {
        console.error("Failed to add bundle to cart:", result.error)
        alert("Failed to add bundle to cart. Please try again.")
      } else {
        console.log("Successfully added bundle to cart")
        alert("Bundle added to cart!")
      }
    } catch (err) {
      console.error("Error adding bundle to cart:", err)
      alert("An error occurred. Please try again.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <BundleConfigurationWatcher />
        {children}
      </form>
    </Form>
  )
}

function BundleConfigurationWatcher() {
  const { configureBundle } = useShopperProductContext()
  const form = useFormContext()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const selectedOptions = useWatch({ 
    control: form.control,
    name: "selectedOptions" 
  }) as FormSelectedOptions | undefined
  
  const previousSelectedRef = useRef<string | undefined>(undefined)
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Store latest values in refs to avoid stale closures
  const latestSelectedOptionsRef = useRef<FormSelectedOptions | undefined>(selectedOptions)
  latestSelectedOptionsRef.current = selectedOptions

  useEffect(() => {
    if (configureBundle && selectedOptions) {
      // Convert to string for stable comparison
      const currentSelectedString = JSON.stringify(selectedOptions)
      
      // Only update if the selection actually changed
      if (previousSelectedRef.current !== currentSelectedString) {
        previousSelectedRef.current = currentSelectedString
        
        const bundleConfiguration = {
          selected_options: formSelectedOptionsToData(selectedOptions)
        }
        configureBundle(bundleConfiguration)
        
        // Clear any pending URL update
        if (urlUpdateTimeoutRef.current) {
          clearTimeout(urlUpdateTimeoutRef.current)
        }
        
        // Update URL with small debounce to batch rapid changes
        urlUpdateTimeoutRef.current = setTimeout(() => {
          try {
            // Update URL with new config
            const params = new URLSearchParams(searchParams)
            
            // Only include non-empty selections
            const hasSelections = Object.values(selectedOptions).some(
              opts => opts && opts.length > 0
            )
            
            if (hasSelections) {
              // Encode the selected options as base64 to make URL cleaner
              const configString = btoa(JSON.stringify(selectedOptions))
              params.set('config', configString)
            } else {
              params.delete('config')
            }
            
            // Update URL without adding to history
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
          } catch (e) {
            console.warn('Failed to update URL:', e)
          }
        }, 50) // Very short debounce - just enough to batch rapid clicks
      }
    }
  }, [selectedOptions, configureBundle, router, pathname, searchParams])

  // Separate effect for cleanup on unmount
  useEffect(() => {
    return () => {
      // On unmount, immediately update URL with latest selection if there's a pending update
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current)
        
        // Use the latest selected options from ref
        const latestOptions = latestSelectedOptionsRef.current
        if (latestOptions) {
          try {
            const params = new URLSearchParams(window.location.search)
            const hasSelections = Object.values(latestOptions).some(
              opts => opts && opts.length > 0
            )
            
            if (hasSelections) {
              const configString = btoa(JSON.stringify(latestOptions))
              params.set('config', configString)
              // Use window.history.replaceState for synchronous update on unmount
              const newUrl = `${window.location.pathname}?${params.toString()}`
              window.history.replaceState({}, '', newUrl)
            }
          } catch (e) {
            console.warn('Failed to update URL on unmount:', e)
          }
        }
      }
    }
  }, []) // Empty deps - only run on mount/unmount

  return null
}