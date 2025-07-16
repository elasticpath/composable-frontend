"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./constants"
import {
  postV2AccountMembersTokens,
  getV2AccountAddresses,
  client,
  checkoutApi,
  BillingAddress,
  ShippingAddress,
  initializeCart as sdkInitializeCart,
  manageCarts,
  getCart,
  deleteACartItem,
  updateACartItem,
  deleteAllCartItems,
  deleteAPromotionViaPromotionCode,
} from "@epcc-sdk/sdks-shopper"
import { configureClient } from "../lib/api-client"

import { retrieveAccountMemberCredentials } from "../lib/auth"

configureClient()

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID || ""

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  returnUrl: z.string().optional(),
})

const loginErrorMessage =
  "Failed to login, make sure your email and password are correct"

export async function login(formData: FormData) {
  const rawEntries = Object.fromEntries(formData.entries())
  const validatedProps = loginSchema.safeParse(rawEntries)

  if (!validatedProps.success) {
    return {
      error: loginErrorMessage,
    }
  }

  const { email, password, returnUrl } = validatedProps.data

  try {
    const result = await postV2AccountMembersTokens({
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "password",
          password_profile_id: PASSWORD_PROFILE_ID,
          username: email.toLowerCase(),
          password,
        },
      },
    })

    const cookieStore = await cookies()

    if (
      !result.data?.data ||
      !Array.isArray(result.data.data) ||
      result.data.data.length === 0
    ) {
      return {
        error: loginErrorMessage,
      }
    }

    const memberData = result.data.data[0]
    if (!memberData) {
      return {
        error: loginErrorMessage,
      }
    }

    const tokenData = {
      token: memberData.token,
      accountId: memberData.account_id,
      // expires is a string in ISO format (e.g. '2025-05-08T16:23:40.901Z')
      // Convert it to a Unix timestamp (seconds since epoch)
      expires: memberData.expires
        ? Math.floor(new Date(memberData.expires).getTime() / 1000)
        : // Fallback: 24 hours from now if expires is missing
          Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000),
      email: email,
      name: memberData.account_name || "",
    }

    cookieStore.set({
      name: ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
      value: JSON.stringify(tokenData),
      path: "/",
      sameSite: "strict",
      expires: new Date(tokenData.expires * 1000),
    })
  } catch (error) {
    console.error(error)
    return {
      error: loginErrorMessage,
    }
  }

  redirect(returnUrl ?? "/")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)
  redirect("/")
}

export async function initializeCart() {
  try {
    const result = await sdkInitializeCart()
    return { success: true, cartId: result }
  } catch (error) {
    console.error("Failed to initialize cart:", error)
    return { error: "Failed to initialize cart" }
  }
}

export async function addToCart(productId: string, cartId: string) {
  try {
    const response = await manageCarts({
      path: {
        cartID: cartId,
      },
      body: {
        data: {
          type: "cart_item",
          id: productId,
          quantity: 1,
        },
      },
    })

    if (response.error) {
      throw new Error(
        (response.error as any).errors?.[0]?.detail ||
          "Failed to add product to cart",
      )
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error("Failed to add to cart:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to add product to cart",
    }
  }
}

export async function getCartDetails(cartId: string) {
  try {
    const response = await getCart({
      path: {
        cartID: cartId,
      },
      query: {
        include: ["items"],
      },
    })

    if (response.error) {
      throw new Error("Failed to fetch cart")
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error("Failed to get cart:", error)
    return { error: "Failed to fetch cart details" }
  }
}

export async function removeCartItem(cartId: string, itemId: string) {
  try {
    const response = await deleteACartItem({
      path: {
        cartID: cartId,
        cartitemID: itemId,
      },
    })

    if (response.error) {
      throw new Error("Failed to remove item from cart")
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to remove cart item:", error)
    return { error: "Failed to remove item from cart" }
  }
}

export async function updateCartItemQuantity(
  cartId: string,
  itemId: string,
  quantity: number,
) {
  try {
    if (quantity < 1) {
      return await removeCartItem(cartId, itemId)
    }

    const response = await updateACartItem({
      path: {
        cartID: cartId,
        cartitemID: itemId,
      },
      body: {
        data: {
          id: itemId,
          quantity: quantity,
        },
      },
    })

    if (response.error) {
      throw new Error("Failed to update item quantity")
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error("Failed to update cart item quantity:", error)
    return { error: "Failed to update item quantity" }
  }
}

export async function clearCart(cartId: string) {
  try {
    const response = await deleteAllCartItems({
      path: {
        cartID: cartId,
      },
    })

    if (response.error) {
      throw new Error("Failed to clear cart")
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to clear cart:", error)
    return { error: "Failed to clear cart" }
  }
}

export async function applyPromotionCode(cartId: string, code: string) {
  try {
    const response = await manageCarts({
      path: {
        cartID: cartId,
      },
      body: {
        data: {
          type: "promotion_item",
          code: code,
        },
      },
    })

    if (response.error) {
      throw new Error(
        (response.error as any).errors?.[0]?.detail ||
          "Failed to apply promotion code",
      )
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error("Failed to apply promotion code:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to apply promotion code",
    }
  }
}

export async function removePromotionCode(cartId: string, code: string) {
  try {
    const response = await deleteAPromotionViaPromotionCode({
      path: {
        cartID: cartId,
        promoCode: code,
      },
    })

    if (response.error) {
      throw new Error("Failed to remove promotion code")
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to remove promotion code:", error)
    return { error: "Failed to remove promotion code" }
  }
}

export async function checkoutWithAccountToken(
  cartId: string,
  checkoutData: {
    contact: {
      name: string
      email: string
    }
    billing_address: BillingAddress
    shipping_address: ShippingAddress
  },
) {
  try {
    const cookieStore = await cookies()
    const accountTokenCookie = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)

    if (!accountTokenCookie) {
      return { error: "No account authentication token found" }
    }

    const credentials = retrieveAccountMemberCredentials(cookieStore)
    if (!credentials) {
      return { error: "Invalid account authentication token" }
    }

    if (!credentials?.accountId) {
      return { error: "Account ID not found in credentials" }
    }

    const checkoutResponse = await checkoutApi({
      client,
      path: {
        cartID: cartId,
      },
      body: {
        data: {
          account: {
            id: credentials.accountId,
          },
          contact: {
            name: checkoutData.contact.name,
            email: checkoutData.contact.email,
          },
          billing_address: checkoutData.billing_address,
          shipping_address: checkoutData.shipping_address,
        },
      },
      headers: {
        "EP-Account-Management-Authentication-Token": credentials.token,
      },
    })

    if (!checkoutResponse.data?.data) {
      console.error("Checkout response error:", checkoutResponse.error)
      throw new Error("Failed to create order")
    }

    return { success: true, data: checkoutResponse.data }
  } catch (error) {
    console.error("Failed to checkout:", error)
    return {
      error:
        error instanceof Error ? error.message : "Failed to process checkout",
    }
  }
}

export async function getAccountAddresses() {
  try {
    const cookieStore = await cookies()
    const credentials = retrieveAccountMemberCredentials(cookieStore)

    if (!credentials || !credentials.accountId) {
      return { error: "Not authenticated" }
    }

    const addresses = await getV2AccountAddresses({
      client,
      path: {
        accountID: credentials.accountId,
      },
      headers: {
        "EP-Account-Management-Authentication-Token": credentials.token,
      },
    })

    return { success: true, data: addresses.data?.data || [] }
  } catch (error) {
    console.error("Failed to fetch addresses:", error)
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch addresses",
    }
  }
}

export async function applyShippingOption(
  cartId: string,
  optionId: string,
  shippingData: {
    name: string
    description: string
    price_cents: number
  },
) {
  try {
    // First, remove any existing shipping options
    const removeResult = await removeShippingOptions(cartId)
    if (!removeResult.success) {
      return removeResult
    }

    // Add the new shipping option as a custom cart item
    const response = await manageCarts({
      path: {
        cartID: cartId,
      },
      body: {
        data: {
          type: "custom_item",
          name: shippingData.name,
          description: shippingData.description,
          sku: `shipping_${optionId}`,
          quantity: 1,
          price: {
            amount: shippingData.price_cents,
            includes_tax: true,
          },
        },
      },
    })

    if (response.error) {
      throw new Error(
        (response.error as any).errors?.[0]?.detail ||
          "Failed to apply shipping option",
      )
    }

    return { success: true, data: response.data }
  } catch (error) {
    console.error("Failed to apply shipping option:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to apply shipping option",
    }
  }
}

export async function removeShippingOptions(cartId: string) {
  try {
    // Get current cart to find shipping items
    const cartResult = await getCartDetails(cartId)
    if (!cartResult.success) {
      return cartResult
    }

    const cart = cartResult.data
    const shippingItems =
      cart?.included?.items?.filter(
        (item: any) =>
          item.type === "custom_item" && item.sku?.startsWith("shipping_"),
      ) || []

    // Remove each shipping item
    for (const item of shippingItems) {
      if (item.id) {
        const removeResult = await removeCartItem(cartId, item.id)
        if (!removeResult.success) {
          return removeResult
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to remove shipping options:", error)
    return { error: "Failed to remove shipping options" }
  }
}
