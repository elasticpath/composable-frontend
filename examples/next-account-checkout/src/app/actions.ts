"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./constants"
import {
  postV2AccountMembersTokens,
  getV2AccountAddresses,
  client,
  AccessTokenResponse,
  checkoutApi,
} from "@epcc-sdk/sdks-shopper"
import { configureClient } from "../lib/api-client"
import {
  requestPasswordResetToken,
  authenticateWithOneTimeToken,
  resetUserPassword,
} from "../lib/password-reset"
import { retrieveAccountMemberCredentials } from "../lib/auth"

configureClient()

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID || ""

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  returnUrl: z.string().optional(),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
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

    // Check if data exists and has at least one element
    if (
      !result.data?.data ||
      !Array.isArray(result.data.data) ||
      result.data.data.length === 0
    ) {
      return {
        error: loginErrorMessage,
      }
    }

    // Safely access the first item
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

// Cart Management Actions
export async function initializeCart() {
  const { initializeCart } = await import("@epcc-sdk/sdks-shopper")

  try {
    const result = await initializeCart()
    return { success: true, cartId: result }
  } catch (error) {
    console.error("Failed to initialize cart:", error)
    return { error: "Failed to initialize cart" }
  }
}

export async function addToCart(productId: string, cartId: string) {
  const { manageCarts } = await import("@epcc-sdk/sdks-shopper")

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
  const { getCart } = await import("@epcc-sdk/sdks-shopper")

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
  const { deleteACartItem } = await import("@epcc-sdk/sdks-shopper")

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
  const { updateACartItem } = await import("@epcc-sdk/sdks-shopper")

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
  const { deleteAllCartItems } = await import("@epcc-sdk/sdks-shopper")

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
  const { manageCarts } = await import("@epcc-sdk/sdks-shopper")

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
  const { deleteAPromotionViaPromotionCode } = await import(
    "@epcc-sdk/sdks-shopper"
  )

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

// Authenticated Checkout Action
export async function checkoutWithAccountToken(
  cartId: string,
  checkoutData: {
    contact: {
      name: string
      email: string
    }
    billing_address: {
      first_name: string
      last_name: string
      line_1: string
      city?: string
      region: string
      postcode?: string
      country: string
    }
    shipping_address: {
      first_name: string
      last_name: string
      line_1: string
      city?: string
      region: string
      postcode?: string
      country: string
      instructions?: string
    }
  },
) {
  try {
    const cookieStore = await cookies()
    const accountTokenCookie = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)

    if (!accountTokenCookie) {
      return { error: "No account authentication token found" }
    }

    let accountToken: string

    // Parse account credentials
    const credentials = retrieveAccountMemberCredentials(cookieStore)
    if (!credentials) {
      return { error: "Invalid account authentication token" }
    }

    accountToken = credentials.token
    console.log("Account token found:", !!accountToken)

    // Use the SDK checkout API with account authentication

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
          billing_address: {
            ...checkoutData.billing_address,
            company_name: "",
            line_2: "",
            county: "",
          } as any,
          shipping_address: {
            ...checkoutData.shipping_address,
            company_name: "",
            line_2: "",
            county: "",
            phone_number: "",
          } as any,
        },
      },
      headers: {
        "EP-Account-Management-Authentication-Token": accountToken,
      },
    })

    console.log("checkoutResponse", checkoutResponse)

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

    console.log("getAccountAddresses credentials:", credentials)

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
