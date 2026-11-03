'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  type CartEntityResponse, 
  type CartItemObject, 
  type CustomItemObject, 
  type SubscriptionItemObject, 
  type PromotionItemObject 
} from "@epcc-sdk/sdks-shopper";

type CartItem = CartItemObject | CustomItemObject | SubscriptionItemObject | PromotionItemObject;

function isCartItemObject(item: CartItem): item is CartItemObject {
  return 'type' in item && item.type === 'cart_item';
}

function isCustomItemObject(item: CartItem): item is CustomItemObject {
  return 'data' in item && item.data?.type === 'custom_item';
}

function isSubscriptionItemObject(item: CartItem): item is SubscriptionItemObject {
  return 'data' in item && item.data?.type === 'subscription_item';
}

function isPromotionItemObject(item: CartItem): item is PromotionItemObject {
  return 'data' in item && item.data?.type === 'promotion_item';
}

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartData, setCartData] = useState<CartEntityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart");
      const responseData = await response.json();
      setCartData(responseData.data);
    } catch (error) {
      console.error('Failed to fetch cart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemQuantity = (item: CartItem): number => {
    if (isCartItemObject(item)) {
      return item.quantity || 0;
    }
    if (isCustomItemObject(item)) {
      return item.data?.quantity || 0;
    }
    if (isSubscriptionItemObject(item)) {
      return item.data?.quantity || 0;
    }
    // Promotion items don't have quantity
    return 0;
  };

  const getItemName = (item: CartItem): string => {
    if (isCartItemObject(item)) {
      return item.name || 'Product';
    }
    if (isCustomItemObject(item)) {
      return item.data?.name || 'Custom Item';
    }
    if (isSubscriptionItemObject(item)) {
      return item.data?.name || 'Subscription';
    }
    if (isPromotionItemObject(item)) {
      return `Promotion: ${item.data?.code || 'Code'}`;
    }
    return 'Item';
  };

  const getItemDescription = (item: CartItem): string | undefined => {
    if (isCartItemObject(item)) {
      return item.description;
    }
    if (isCustomItemObject(item)) {
      return item.data?.description;
    }
    if (isSubscriptionItemObject(item)) {
      return item.data?.description;
    }
    return undefined;
  };

  const getItemPrice = (item: CartItem): string => {
    if (isCartItemObject(item)) {
      return item.meta?.display_price?.with_tax?.value?.formatted || '£0.00';
    }
    if (isSubscriptionItemObject(item)) {
      // Subscription items have meta within data
      return (item.data as any)?.meta?.display_price?.with_tax?.value?.formatted || '£0.00';
    }
    if (isCustomItemObject(item)) {
      // Custom items have meta at the root level
      return (item as any).meta?.display_price?.with_tax?.value?.formatted || '£0.00';
    }
    // Promotion items don't have a price
    return '';
  };

  const getItemId = (item: CartItem): string => {
    if (isCartItemObject(item)) {
      return item.id || '';
    }
    // All other item types have id at root level
    return (item as any).id || '';
  };

  const totalQuantity = cartData?.included?.items?.reduce((sum, item) => sum + getItemQuantity(item as any), 0) || 0;
  const cartTotal = cartData?.data?.meta?.display_price?.with_tax?.formatted || '£0.00';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-orange-500 font-medium relative flex items-center gap-1 px-3 py-2"
      >
        <Image src="/basket-icon.svg" alt="Basket" width={20} height={20} />
        <span style={{ fontSize: '13px', fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}>Basket</span>
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalQuantity}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Basket</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : !cartData?.included?.items || cartData?.included.items.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Your basket is empty</p>
                <Link
                  href="/plus"
                  className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Browse Memberships
                </Link>
              </div>
            ) : (
              <div className="p-4">
                {cartData.included?.items.map((item: any) => {
                  const itemId = getItemId(item);
                  const itemName = getItemName(item);
                  const itemDescription = getItemDescription(item);
                  const itemQuantity = getItemQuantity(item);
                  const itemPrice = getItemPrice(item);
                  const isPromotion = isPromotionItemObject(item);

                  return (
                    <div key={itemId} className="flex items-start space-x-3 mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h4 className={`font-medium ${isPromotion ? 'text-green-700' : 'text-gray-900'}`}>
                          {itemName}
                        </h4>
                        {itemDescription && (
                          <p className="text-sm text-gray-500 mt-1">{itemDescription}</p>
                        )}
                        {!isPromotion && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">
                              {itemQuantity > 0 && `Qty: ${itemQuantity}`}
                            </span>
                            <span className="font-medium text-gray-900">
                              {itemPrice}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Show promotions if any */}
                {cartData.included.promotions && cartData.included.promotions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Applied Promotions</h5>
                    {cartData.included.promotions.map((promo) => (
                      <div key={promo.id} className="text-sm text-green-600 mb-1">
                        {promo.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {cartData?.included?.items && cartData?.included.items.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-lg text-gray-900">
                  {cartTotal}
                </span>
              </div>
              <Link
                href="/cart"
                className="block w-full bg-orange-500 text-white text-center px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Go to Cart
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}