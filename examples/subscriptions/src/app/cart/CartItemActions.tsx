'use client';

import { useState } from 'react';
import { removeFromCart, updateCartItemQuantity } from '@/app/actions/cart';

interface CartItemActionsProps {
  itemId: string;
  quantity: number;
}

export default function CartItemActions({ itemId, quantity }: CartItemActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const result = await updateCartItemQuantity(itemId, newQuantity);
      if (result.success) {
        setCurrentQuantity(newQuantity);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(currentQuantity - 1)}
          disabled={currentQuantity <= 1 || isUpdating}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">
          {currentQuantity}
        </span>
        <button
          onClick={() => handleQuantityChange(currentQuantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Remove
      </button>
    </div>
  );
}