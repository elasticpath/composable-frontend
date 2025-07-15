"use client"

import React, { useState, useEffect } from "react"
import { useCart } from "./cart-provider"
import { useAuth } from "../hooks/use-auth"
import { getAccountAddresses } from "../app/actions"
import { BillingAddress, ShippingAddress } from "@epcc-sdk/sdks-shopper"
import Link from "next/link"

type Props = {
  onBack?: () => void
}

export function CheckoutView({ onBack }: Props) {
  const { cartId } = useCart()
  const { isAuthenticated, user, isLoading } = useAuth()
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedBillingAddress, setSelectedBillingAddress] =
    useState<string>("")
  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<string>("")

  console.log("auth", isAuthenticated)

  const COUNTRIES = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
  ] as const

  const [form, setForm] = useState({
    billing: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      line1: "",
      line2: "",
      city: "",
      county: "",
      region: "",
      postcode: "",
      country: COUNTRIES[0].value,
      companyName: "",
      instructions: "",
    },
    shipping: {
      firstName: "",
      lastName: "",
      email: "",
      line1: "",
      line2: "",
      city: "",
      county: "",
      region: "",
      postcode: "",
      country: COUNTRIES[0].value,
      companyName: "",
      phoneNumber: "",
      instructions: "",
    },
    sameAsBilling: true,
  })

  // Fetch saved addresses when authenticated
  useEffect(() => {
    async function fetchAddresses() {
      if (isAuthenticated && !isLoading) {
        setLoadingAddresses(true)
        try {
          const result = await getAccountAddresses()

          console.log("result addresses", result)

          if (result.success) {
            setSavedAddresses(result.data)
          }
        } catch (error) {
          console.error("Failed to fetch addresses:", error)
        } finally {
          setLoadingAddresses(false)
        }
      }
    }

    fetchAddresses()
  }, [isAuthenticated, isLoading])

  // Handle address selection
  const handleAddressSelection = (
    addressId: string,
    type: "billing" | "shipping",
  ) => {
    const address = savedAddresses.find((addr) => addr.id === addressId)
    if (!address) return

    const addressData = {
      firstName: address.first_name || "",
      lastName: address.last_name || "",
      email: address.email || user?.email || "",
      line1: address.line_1 || "",
      line2: address.line_2 || "",
      city: address.city || "",
      county: address.county || "",
      region: address.region || "",
      postcode: address.postcode || "",
      country: address.country || "US",
      companyName: address.company_name || "",
      phoneNumber: address.phone_number || "",
      instructions: address.instructions || "",
    }

    if (type === "billing") {
      setSelectedBillingAddress(addressId)
      setForm((prev) => ({ ...prev, billing: addressData }))
    } else {
      setSelectedShippingAddress(addressId)
      setForm((prev) => ({ ...prev, shipping: addressData }))
    }
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{
    orderId: string
    reference: string
    status: string
    total: string
  } | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    const isCheckbox =
      e.target instanceof HTMLInputElement && e.target.type === "checkbox"
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function handleAddressFieldChange(
    addressType: "billing" | "shipping",
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [name]: value,
      },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Check authentication first
    if (!isAuthenticated) {
      setError("Please log in to complete your order")
      return
    }

    // Basic validation - only validate fields that are truly required from user
    if (
      !form.billing.firstName ||
      !form.billing.lastName ||
      !form.billing.email ||
      !form.billing.line1 ||
      !form.billing.region
    ) {
      setError("Please fill in all required fields.")
      return
    }

    if (!form.sameAsBilling) {
      if (
        !form.shipping.firstName ||
        !form.shipping.lastName ||
        !form.shipping.line1 ||
        !form.shipping.region
      ) {
        setError("Please fill in all required shipping fields.")
        return
      }
    }

    if (!cartId) {
      setError("No cart found")
      return
    }

    try {
      setLoading(true)

      // Prepare checkout data
      const shippingAddress = form.sameAsBilling
        ? {
            first_name: form.billing.firstName,
            last_name: form.billing.lastName,
            line_1: form.billing.line1,
            line_2: form.billing.line2,
            city: form.billing.city,
            county: form.billing.county,
            region: form.billing.region,
            postcode: form.billing.postcode,
            country: form.billing.country,
            company_name: form.billing.companyName,
            phone_number: "",
            instructions: form.billing.instructions || "",
          }
        : {
            first_name: form.shipping.firstName,
            last_name: form.shipping.lastName,
            line_1: form.shipping.line1,
            line_2: form.shipping.line2,
            city: form.shipping.city,
            county: form.shipping.county,
            region: form.shipping.region,
            postcode: form.shipping.postcode,
            country: form.shipping.country,
            company_name: form.shipping.companyName,
            phone_number: form.shipping.phoneNumber,
            instructions: form.shipping.instructions,
          }

      const billingAddress: BillingAddress = {
        first_name: form.billing.firstName || "",
        last_name: form.billing.lastName || "",
        line_1: form.billing.line1 || "",
        line_2: form.billing.line2 || "",
        city: form.billing.city || "",
        county: form.billing.county || "",
        region: form.billing.region || "",
        postcode: form.billing.postcode || "",
        country: form.billing.country || "",
        company_name: form.billing.companyName || "",
      }

      const shippingAddressTyped: ShippingAddress = {
        first_name: shippingAddress.first_name || "",
        last_name: shippingAddress.last_name || "",
        line_1: shippingAddress.line_1 || "",
        line_2: shippingAddress.line_2 || "",
        city: shippingAddress.city || "",
        county: shippingAddress.county || "",
        region: shippingAddress.region || "",
        postcode: shippingAddress.postcode || "",
        country: shippingAddress.country || "",
        company_name: shippingAddress.company_name || "",
        phone_number: shippingAddress.phone_number || "",
        instructions: shippingAddress.instructions || "",
      }

      const checkoutData = {
        contact: {
          name: `${form.billing.firstName} ${form.billing.lastName}`,
          email: form.billing.email,
        },
        billing_address: billingAddress,
        shipping_address: shippingAddressTyped,
      }

      // Call the authenticated checkout action
      const { checkoutWithAccountToken } = await import("../app/actions")
      const result = await checkoutWithAccountToken(cartId, checkoutData)

      if (!result.success) {
        setError(result.error || "Checkout failed")
        return
      }

      // Set confirmation data
      const order = result.data?.data
      if (order) {
        setConfirmation({
          orderId: order.id || "",
          reference: (order as any).reference || order.id || "",
          status: (order as any).status || "processing",
          total:
            (order as any).meta?.display_price?.with_tax?.formatted || "N/A",
        })
      }
    } catch (err) {
      console.error("Checkout failed:", err)
      setError("Checkout failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-medium text-black mb-3">Checkout</h3>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-black">Checkout</h3>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            ← Back to Cart
          </button>
        </div>

        <div className="text-center py-8">
          <h4 className="text-lg font-medium text-black mb-2">
            Login Required
          </h4>
          <p className="text-gray-600 mb-4">
            Please log in to complete your checkout
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  // Show confirmation if order is complete
  if (confirmation) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-medium text-black mb-4">Order Complete!</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Order ID:</strong> {confirmation.orderId}
          </p>
          <p>
            <strong>Reference:</strong> {confirmation.reference}
          </p>
          <p>
            <strong>Status:</strong> {confirmation.status}
          </p>
          <p>
            <strong>Total:</strong> {confirmation.total}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors"
        >
          Start New Order
        </button>
      </div>
    )
  }

  function renderAddressFields(addressType: "billing" | "shipping") {
    const address = form[addressType]
    const onFieldChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => handleAddressFieldChange(addressType, e)

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="firstName"
            placeholder="First Name *"
            value={address.firstName}
            onChange={onFieldChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name *"
            value={address.lastName}
            onChange={onFieldChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
            required
          />
        </div>

        {addressType === "billing" && (
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={address.email}
            onChange={onFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            required
          />
        )}

        <input
          type="text"
          name="line1"
          placeholder="Address Line 1 *"
          value={address.line1}
          onChange={onFieldChange}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          required
        />

        <input
          type="text"
          name="line2"
          placeholder="Address Line 2 (Optional)"
          value={address.line2}
          onChange={onFieldChange}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />

        <input
          type="text"
          name="companyName"
          placeholder="Company Name (Optional)"
          value={address.companyName}
          onChange={onFieldChange}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={address.city}
            onChange={onFieldChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="text"
            name="county"
            placeholder="County"
            value={address.county}
            onChange={onFieldChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="region"
            placeholder="State/Region *"
            value={address.region}
            onChange={onFieldChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
            required
          />
          {addressType === "shipping" && (
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={(address as any).phoneNumber || ""}
              onChange={onFieldChange}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="postcode"
            placeholder="Postal Code"
            value={address.postcode}
            onChange={onFieldChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <select
            name="country"
            value={address.country}
            onChange={onFieldChange}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        {addressType === "shipping" && (
          <textarea
            name="instructions"
            placeholder="Delivery Instructions (Optional)"
            value={address.instructions}
            onChange={onFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            rows={2}
          />
        )}
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-black">Checkout</h3>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-500 text-sm"
        >
          ← Back to Cart
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Billing Address */}
        <div>
          <h4 className="font-medium text-black mb-3">Billing Address</h4>

          {/* Loading indicator for addresses */}
          {isAuthenticated && loadingAddresses && (
            <div className="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                Loading saved addresses...
              </p>
            </div>
          )}

          {/* Saved Address Selector */}
          {isAuthenticated && savedAddresses.length > 0 && (
            <div className="mb-4 p-3 border border-gray-200 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select saved address:
              </label>
              <select
                value={selectedBillingAddress}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedBillingAddress(value)
                  if (value) {
                    handleAddressSelection(value, "billing")
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="">Enter new address</option>
                {savedAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.name ||
                      `${address.first_name} ${address.last_name}`}{" "}
                    - {address.line_1}, {address.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!savedAddresses.length && (
            <div className="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
              <p className="text-sm text-gray-600">No saved addresses found.</p>
            </div>
          )}

          {renderAddressFields("billing")}
        </div>

        {/* Same as Billing Checkbox */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="sameAsBilling"
              checked={form.sameAsBilling}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm text-black">
              Shipping address is the same as billing address
            </span>
          </label>
        </div>

        {/* Shipping Address */}
        {!form.sameAsBilling && (
          <div>
            <h4 className="font-medium text-black mb-3">Shipping Address</h4>

            {/* Saved Address Selector */}
            {isAuthenticated && savedAddresses.length > 0 && (
              <div className="mb-4 p-3 border border-gray-200 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select saved address:
                </label>
                <select
                  value={selectedShippingAddress}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedShippingAddress(value)
                    if (value) {
                      handleAddressSelection(value, "shipping")
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Enter new address</option>
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name ||
                        `${address.first_name} ${address.last_name}`}{" "}
                      - {address.line_1}, {address.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {renderAddressFields("shipping")}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Complete Order"}
        </button>
      </form>
    </div>
  )
}
