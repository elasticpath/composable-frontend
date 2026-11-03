import { NextResponse } from 'next/server';
import { getACart } from '@epcc-sdk/sdks-shopper';
import { cookies } from 'next/headers';
import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import { CART_COOKIE_KEY } from "@/app/constants";

export async function GET() {
  initializeShopperClient();
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

  if (!cartId) {
    return NextResponse.json({ error: 'No cart found' }, { status: 404 });
  }

  try {
    const response = await getACart({
      path: { cartID: cartId },
      query: {
        include: ['items', 'tax_items', 'custom_discounts', 'promotions'] as const
      }
    });

    if (!response.data || response.error) {
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}