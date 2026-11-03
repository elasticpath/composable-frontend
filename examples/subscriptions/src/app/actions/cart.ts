'use server';

import { revalidatePath } from 'next/cache';
import { manageCarts, deleteACartItem, updateACartItem } from '@epcc-sdk/sdks-shopper';
import { cookies } from 'next/headers';
import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import { CART_COOKIE_KEY } from "@/app/constants";


export async function addSubscriptionToCart(offeringId: string, planId: string, pricingOptionId: string) {
  initializeShopperClient();
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

  if (!cartId) {
    throw new Error('Cart has not been initialized');
  }

  try {

    const body = {
      data: {
        type: 'subscription_item' as const,
        quantity: 1,
        id: offeringId,
        subscription_configuration: {
          plan: planId,
          pricing_option: pricingOptionId
        }
      }
    };

    await manageCarts({
      path: { cartID: cartId },
      body
    });

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Failed to add subscription to cart:', error);
    return { success: false, error: 'Failed to add subscription to cart' };
  }
}

export async function removeFromCart(itemId: string) {
  initializeShopperClient();
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

  if (!cartId) {
    throw new Error('Cart has not been initialized');
  }

  try {
    await deleteACartItem({
      path: { 
        cartID: cartId,
        cartitemID: itemId
      }
    });

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    return { success: false, error: 'Failed to remove item from cart' };
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  initializeShopperClient();
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

  if (!cartId) {
    throw new Error('Cart has not been initialized');
  }

  try {
    await updateACartItem({
      path: { 
        cartID: cartId,
        cartitemID: itemId
      },
      body: {
        data: {
          type: 'cart_item',
          id: itemId,
          quantity
        }
      }
    });

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Failed to update cart item quantity:', error);
    return { success: false, error: 'Failed to update quantity' };
  }
}
