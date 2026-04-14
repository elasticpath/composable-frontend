'use server';

import { revalidatePath } from 'next/cache';
import { manageCarts } from '@epcc-sdk/sdks-shopper';
import { cookies } from 'next/headers';
import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import { CART_COOKIE_KEY } from "@/app/constants";

export async function addProductToCart(productId: string, quantity: number = 1) {
  initializeShopperClient();
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

  if (!cartId) {
    throw new Error('Cart has not been initialized');
  }

  try {
    const body = {
      data: {
        type: 'cart_item' as const,
        id: productId,
        quantity
      }
    };

    const response = await manageCarts({
      path: { cartID: cartId },
      body
    });

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Failed to add product to cart:', error);
    return { success: false, error: 'Failed to add product to cart' };
  }
}