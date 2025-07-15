"use client"

import React, { useState, useEffect } from "react"
import { useCart } from "./cart-provider"
import { useAuth } from "../hooks/use-auth"
import { getAccountAddresses, checkoutWithAccountToken } from "../app/actions"
import { BillingAddress, ShippingAddress } from "@epcc-sdk/sdks-shopper"
import Link from "next/link"
import { Label, Input, Select, Textarea, Button, Alert } from "./ui"

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
          <Button variant="ghost" size="small" onClick={onBack}>
            ← Back to Cart
          </Button>
        </div>

        <div className="text-center py-8">
          <h4 className="text-lg font-medium text-black mb-2">
            Login Required
          </h4>
          <p className="text-gray-600 mb-4">
            Please log in to complete your checkout
          </p>
          <Link href="/login">
            <Button size="large">Log In</Button>
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
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 w-full"
        >
          Start New Order
        </Button>
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${addressType}-firstName`} required>
              First Name
            </Label>
            <Input
              id={`${addressType}-firstName`}
              type="text"
              name="firstName"
              value={address.firstName}
              onChange={onFieldChange}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${addressType}-lastName`} required>
              Last Name
            </Label>
            <Input
              id={`${addressType}-lastName`}
              type="text"
              name="lastName"
              value={address.lastName}
              onChange={onFieldChange}
              required
            />
          </div>
        </div>

        {addressType === "billing" && (
          <div>
            <Label htmlFor={`${addressType}-email`} required>
              Email
            </Label>
            <Input
              id={`${addressType}-email`}
              type="email"
              name="email"
              value={address.email}
              onChange={onFieldChange}
              required
            />
          </div>
        )}

        <div>
          <Label htmlFor={`${addressType}-line1`} required>
            Address Line 1
          </Label>
          <Input
            id={`${addressType}-line1`}
            type="text"
            name="line1"
            value={address.line1}
            onChange={onFieldChange}
            required
          />
        </div>

        <div>
          <Label htmlFor={`${addressType}-line2`}>Address Line 2</Label>
          <Input
            id={`${addressType}-line2`}
            type="text"
            name="line2"
            value={address.line2}
            onChange={onFieldChange}
          />
        </div>

        <div>
          <Label htmlFor={`${addressType}-companyName`}>Company Name</Label>
          <Input
            id={`${addressType}-companyName`}
            type="text"
            name="companyName"
            value={address.companyName}
            onChange={onFieldChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${addressType}-city`} required>
              City
            </Label>
            <Input
              id={`${addressType}-city`}
              type="text"
              name="city"
              value={address.city}
              onChange={onFieldChange}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${addressType}-county`}>County</Label>
            <Input
              id={`${addressType}-county`}
              type="text"
              name="county"
              value={address.county}
              onChange={onFieldChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor={`${addressType}-region`} required>
              State/Region
            </Label>
            <Input
              id={`${addressType}-region`}
              type="text"
              name="region"
              value={address.region}
              onChange={onFieldChange}
              required
            />
          </div>
          {addressType === "shipping" && (
            <div>
              <Label htmlFor={`${addressType}-phoneNumber`}>Phone Number</Label>
              <Input
                id={`${addressType}-phoneNumber`}
                type="text"
                name="phoneNumber"
                value={(address as any).phoneNumber || ""}
                onChange={onFieldChange}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${addressType}-postcode`} required>
              Postal Code
            </Label>
            <Input
              id={`${addressType}-postcode`}
              type="text"
              name="postcode"
              value={address.postcode}
              onChange={onFieldChange}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${addressType}-country`} required>
              Country
            </Label>
            <Select
              id={`${addressType}-country`}
              name="country"
              value={address.country}
              onChange={onFieldChange}
            >
              {COUNTRIES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {addressType === "shipping" && (
          <div>
            <Label htmlFor={`${addressType}-instructions`}>
              Delivery Instructions
            </Label>
            <Textarea
              id={`${addressType}-instructions`}
              name="instructions"
              value={address.instructions}
              onChange={onFieldChange}
              rows={2}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-black">Checkout</h3>
        <Button variant="ghost" size="small" onClick={onBack}>
          ← Back to Cart
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Billing Address */}
        <div>
          <h4 className="font-medium text-black mb-3">Billing Address</h4>

          {/* Loading indicator for addresses */}
          {isAuthenticated && loadingAddresses && (
            <div className="mb-4 p-3 border border-gray-00 rounded bg-gray-50">
              <p className="text-sm text-gray-600">
                Loading saved addresses...
              </p>
            </div>
          )}

          {/* Saved Address Selector */}
          {isAuthenticated && savedAddresses.length > 0 && (
            <div className="mb-4 p-3 border border-gray-300 rounded">
              <Label htmlFor="billing-saved-address">
                Select saved address:
              </Label>
              <Select
                id="billing-saved-address"
                value={selectedBillingAddress}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedBillingAddress(value)
                  if (value) {
                    handleAddressSelection(value, "billing")
                  }
                }}
              >
                <option value="">Enter new address</option>
                {savedAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.name ||
                      `${address.first_name} ${address.last_name}`}{" "}
                    - {address.line_1}, {address.city}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {!savedAddresses.length && !loadingAddresses && (
            <div className="mb-4 p-3 border border-gray-300 rounded bg-gray-50">
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
                <Label htmlFor="shipping-saved-address">
                  Select saved address:
                </Label>
                <Select
                  id="shipping-saved-address"
                  value={selectedShippingAddress}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedShippingAddress(value)
                    if (value) {
                      handleAddressSelection(value, "shipping")
                    }
                  }}
                >
                  <option value="">Enter new address</option>
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name ||
                        `${address.first_name} ${address.last_name}`}{" "}
                      - {address.line_1}, {address.city}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {renderAddressFields("shipping")}
          </div>
        )}

        {/* Error Display */}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={loading}
          className="w-full"
          variant="primary"
          size="large"
        >
          Complete Order
        </Button>
      </form>
    </div>
  )
}
