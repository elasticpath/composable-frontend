"use client"

import { useState, useEffect } from "react"
import { BillingAddress, ShippingAddress } from "@epcc-sdk/sdks-shopper"
import { useCart } from "./cart-provider"
import { checkoutWithAccountToken } from "../app/actions"
import Link from "next/link"

type Props = {
  onBack?: () => void
  isUserAuthenticated: boolean
}

type CheckoutForm = {
  customer: {
    email: string
  }
  billing_address: BillingAddress
  shipping_address: ShippingAddress
  sameAsBilling: boolean
}

export function CheckoutView({ onBack, isUserAuthenticated }: Props) {
  const { cartId } = useCart()
  const [form, setForm] = useState<CheckoutForm>({
    customer: {
      email: "",
    },
    billing_address: {
      first_name: "",
      last_name: "",
      company_name: "",
      line_1: "",
      line_2: "",
      city: "",
      region: "",
      postcode: "",
      county: "",
      country: "US",
    },
    shipping_address: {
      first_name: "",
      last_name: "",
      company_name: "",
      phone_number: "",
      line_1: "",
      line_2: "",
      city: "",
      region: "",
      postcode: "",
      county: "",
      country: "US",
      instructions: "",
    },
    sameAsBilling: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{
    orderId: string
    reference: string
    status: string
    total: string
  } | null>(null)

  const COUNTRIES = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
  ] as const

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

  function handleCustomerFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [name]: value,
      },
    }))
  }

  function handleAddressFieldChange(
    addressType: "billing_address" | "shipping_address",
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

    if (!cartId) {
      setError("No cart found. Please refresh the page.")
      return
    }

    // Simple validation
    if (!form.customer.email.trim()) {
      setError("Email is required")
      return
    }

    if (!form.billing_address.first_name.trim()) {
      setError("Billing first name is required")
      return
    }

    if (!form.billing_address.last_name.trim()) {
      setError("Billing last name is required")
      return
    }

    if (!form.billing_address.line_1.trim()) {
      setError("Billing address is required")
      return
    }

    if (!form.billing_address.city.trim()) {
      setError("Billing city is required")
      return
    }

    if (!form.billing_address.postcode.trim()) {
      setError("Billing postal code is required")
      return
    }

    if (!form.sameAsBilling) {
      if (!form.shipping_address.first_name.trim()) {
        setError("Shipping first name is required")
        return
      }

      if (!form.shipping_address.last_name.trim()) {
        setError("Shipping last name is required")
        return
      }

      if (!form.shipping_address.line_1.trim()) {
        setError("Shipping address is required")
        return
      }

      if (!form.shipping_address.city.trim()) {
        setError("Shipping city is required")
        return
      }

      if (!form.shipping_address.postcode.trim()) {
        setError("Shipping postal code is required")
        return
      }
    }

    try {
      setLoading(true)

      // Prepare checkout data - now properly typed and simplified
      const billingAddress = form.billing_address satisfies BillingAddress
      const shippingAddress = form.sameAsBilling
        ? ({
            ...form.billing_address,
            phone_number: "",
            instructions: "",
          } satisfies ShippingAddress)
        : (form.shipping_address satisfies ShippingAddress)

      const checkoutData = {
        contact: {
          name: `${form.billing_address.first_name} ${form.billing_address.last_name}`,
          email: form.customer.email,
        },
        billing_address: billingAddress,
        shipping_address: shippingAddress,
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

  // If user is not authenticated, show login prompt
  if (!isUserAuthenticated) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-3 text-black">Checkout</h2>
        <div className="text-center py-8">
          <h4 className="text-lg font-medium text-black mb-2">
            Login Required
          </h4>
          <p className="text-gray-600 mb-4">
            Please log in to complete your checkout
          </p>
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
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
      <div>
        <h2 className="text-xl font-semibold text-black mb-4">
          Thank you for your order!
        </h2>
        <div className="mb-4">
          <span className="text-sm text-gray-500">Order ID: </span>
          <span className="text-sm font-mono break-all">
            {confirmation.orderId}
          </span>
        </div>
        <div className="mb-4">
          <span className="text-sm text-gray-500">Status: </span>
          <span className="text-sm font-mono break-all">
            {confirmation.status}
          </span>
        </div>
        <div className="mb-4">
          <span className="text-sm text-gray-500">Total: </span>
          <span className="">{confirmation.total}</span>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-2 text-blue-600 hover:underline"
          >
            Back to store
          </button>
        )}
      </div>
    )
  }

  function renderAddressFields(
    addressType: "billing_address" | "shipping_address",
  ) {
    const addr = form[addressType]
    const onFieldChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => handleAddressFieldChange(addressType, e)

    return (
      <>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name*
            </label>
            <input
              name="first_name"
              value={addr.first_name}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name*
            </label>
            <input
              name="last_name"
              value={addr.last_name}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            name="company_name"
            value={addr.company_name}
            onChange={onFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1*
          </label>
          <input
            name="line_1"
            value={addr.line_1}
            onChange={onFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <input
            name="line_2"
            value={addr.line_2}
            onChange={onFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <input
              name="city"
              value={addr.city}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region*
            </label>
            <input
              name="region"
              value={addr.region}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code*
            </label>
            <input
              name="postcode"
              value={addr.postcode}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County
            </label>
            <input
              name="county"
              value={addr.county}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country*
          </label>
          <select
            name="country"
            value={addr.country}
            onChange={onFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
            required
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {addressType === "shipping_address" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions
            </label>
            <textarea
              name="instructions"
              value={(addr as ShippingAddress).instructions}
              onChange={onFieldChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="my-4 text-blue-600 hover:underline"
        >
          &larr; Back to Cart
        </button>
      )}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <h2 className="text-lg font-semibold text-black">Guest Checkout</h2>

        <h3 className="text-md font-semibold text-black">
          Customer Information
        </h3>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address*
          </label>
          <input
            name="email"
            type="email"
            value={form.customer.email}
            onChange={handleCustomerFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <hr className="my-4 border-gray-200" />

        <h3 className="text-md font-semibold text-black">Billing Address</h3>

        {renderAddressFields("billing_address")}

        <hr className="my-4 border-gray-200" />

        <h3 className="text-md font-semibold text-black">Shipping Address</h3>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="sameAsBilling"
            name="sameAsBilling"
            checked={form.sameAsBilling}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="sameAsBilling" className="text-sm text-gray-700">
            Same as billing address
          </label>
        </div>

        {form.sameAsBilling ? null : renderAddressFields("shipping_address")}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : "Complete Checkout"}
        </button>
      </form>
    </>
  )
}
