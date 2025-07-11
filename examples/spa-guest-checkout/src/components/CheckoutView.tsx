import React, { useState } from "react"
import { getCartId, checkoutApi } from "@epcc-sdk/sdks-shopper"

type Props = {
  onBack?: () => void
}

export function CheckoutView({ onBack }: Props) {
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
      email: "",
      line1: "",
      city: "",
      region: "",
      postcode: "",
      country: COUNTRIES[0].value,
      // present to align with shipping shape; not rendered
      instructions: "",
    },
    shipping: {
      firstName: "",
      lastName: "",
      email: "",
      line1: "",
      city: "",
      region: "",
      postcode: "",
      country: COUNTRIES[0].value,
      instructions: "", // optional delivery instructions
    },
    sameAsBilling: true,
  })

  // Process state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{
    orderId: string
    reference: string
    status: string
    total: string
  } | null>(null)

  // Handles changes to top-level fields like `sameAsBilling`.
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

  // Handles nested billing / shipping field updates.
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

    // rudimentary front-end validation
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

    // If shipping differs, ensure its required fields
    if (!form.sameAsBilling) {
      if (
        !form.shipping.line1 ||
        !form.shipping.city ||
        !form.shipping.region
      ) {
        setError("Please complete shipping address fields.")
        return
      }
    }

    try {
      setLoading(true)

      const cartId = getCartId()
      if (!cartId) {
        throw new Error("No cart found. Please add items first.")
      }

      // Build customer checkout payload as per EP docs
      const customerData = {
        customer: {
          email: form.billing.email,
          name: `${form.billing.firstName} ${form.billing.lastName}`,
        },
        billing_address: {
          first_name: form.billing.firstName,
          last_name: form.billing.lastName,
          line_1: form.billing.line1,
          city: form.billing.city,
          region: form.billing.region,
          postcode: form.billing.postcode,
          country: form.billing.country,
        },
        shipping_address: form.sameAsBilling
          ? {
              first_name: form.billing.firstName,
              last_name: form.billing.lastName,
              line_1: form.billing.line1,
              city: form.billing.city,
              region: form.billing.region,
              postcode: form.billing.postcode,
              country: form.billing.country,
            }
          : {
              first_name: form.shipping.firstName,
              last_name: form.shipping.lastName,
              line_1: form.shipping.line1,
              city: form.shipping.city,
              region: form.shipping.region,
              postcode: form.shipping.postcode,
              country: form.shipping.country,
              ...(form.shipping.instructions && {
                instructions: form.shipping.instructions,
              }),
            },
      }

      // Convert cart to order
      const checkoutRes = await checkoutApi({
        path: { cartID: cartId },
        body: { data: customerData as any },
      })

      const order = checkoutRes.data?.data
      const orderId = order?.id
      if (!orderId) throw new Error("Failed to create order")

      // At this stage we only convert cart to order; skip payment setup

      setConfirmation({
        orderId: order.id,
        reference: (order as any).reference ?? "-",
        status: (order as any).status ?? "created",
        total:
          (order as any).meta?.display_price?.with_tax?.formatted ||
          "Unknown total",
      })

      // Fire cart update event – cart will now be empty
      window.dispatchEvent(new Event("cart:updated"))
    } catch (err: any) {
      setError(err?.message || "Checkout failed. Please try again.")
      console.error("Checkout error", err)
    } finally {
      setLoading(false)
    }
  }

  function renderAddressFields(addressType: "billing" | "shipping") {
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
              name="firstName"
              value={addr.firstName}
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
              name="lastName"
              value={addr.lastName}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        {addressType === "billing" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              name="email"
              type="email"
              value={addr.email}
              onChange={onFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1*
          </label>
          <input
            name="line1"
            value={addr.line1}
            onChange={onFieldChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

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

        {addressType === "shipping" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Instructions (optional)
            </label>
            <textarea
              name="instructions"
              value={(addr as any).instructions}
              onChange={(e) => handleAddressFieldChange("shipping", e)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        )}
      </>
    )
  }

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

        <h3 className="text-md font-semibold text-black">Billing Address</h3>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {renderAddressFields("billing")}

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

        {form.sameAsBilling ? null : renderAddressFields("shipping")}

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
