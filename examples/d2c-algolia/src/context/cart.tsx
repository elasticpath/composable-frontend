import { useEffect, useState, useContext, createContext } from "react";
import { CartItem, CartItemsResponse } from "@moltin/sdk";
import { getCartItems } from "../services/cart";
import { ProviderProps } from "./types";

interface CartState {
  cartData: CartItem[];
  cartRes: CartItemsResponse | undefined;
  promotionItems: CartItem[];
  count: number;
  cartQuantity: number;
  setCartQuantity: (qt: number) => void;
  showCartPopup: boolean;
  handleShowCartPopup: () => void;
  totalPrice: string;
  updateCartItems: () => void;
  addedItem: string;
  setAddedItem: (added: string) => void;
  mcart: string;
}

const CartItemsContext = createContext<CartState | undefined>(undefined);

function CartReducer(): CartState {
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [promotionItems, setPromotionItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [cartRes, setCartRes] = useState<CartItemsResponse>();
  const [mcart, setMcart] = useState("");

  const [addedItem, setAddedItem] = useState("");

  useEffect(() => {
    const cart = localStorage.getItem("mcart") || "";
    setMcart(cart);
  });

  useEffect(() => {
    if (mcart) {
      getCartItems(mcart).then((res) => {
        setCartRes(res);
        setCartData(
          res.data.filter(
            ({ type }) => type === "cart_item" || type === "custom_item"
          )
        );
        setPromotionItems(
          res.data.filter(({ type }) => type === "promotion_item")
        );
        setCount(res.data.reduce((sum, { quantity }) => sum + quantity, 0));
        setTotalPrice(res.meta.display_price.without_tax.formatted);
      });
    }
  }, [mcart]);

  const updateCartItems = () => {
    const mcart = localStorage.getItem("mcart") || "";
    getCartItems(mcart).then((res) => {
      const cartData = res.data.length
        ? res.data.filter(
            ({ type }) => type === "cart_item" || type === "custom_item"
          )
        : [];
      setCartData(cartData);
      const promotionItems = res.data.length
        ? res.data.filter(({ type }) => type === "promotion_item")
        : [];
      setPromotionItems(promotionItems);
      const itemQuantity = res.data.length
        ? res.data.reduce((sum, { quantity }) => sum + quantity, 0)
        : 0;
      setCount(itemQuantity);
      const totalPrice = res.meta
        ? res.meta.display_price.without_tax.formatted
        : "";
      setTotalPrice(totalPrice);
    });
  };

  const handleShowCartPopup = () => {
    if (!showCartPopup) {
      setShowCartPopup(true);
      setTimeout(() => {
        setShowCartPopup(false);
      }, 3200);
    }
  };

  return {
    cartData,
    cartRes,
    promotionItems,
    count,
    cartQuantity,
    setCartQuantity,
    showCartPopup,
    handleShowCartPopup,
    totalPrice,
    updateCartItems,
    addedItem,
    setAddedItem,
    mcart,
  };
}

function CartProvider({ children }: ProviderProps) {
  const value = CartReducer();
  return (
    <CartItemsContext.Provider value={value}>
      {children}
    </CartItemsContext.Provider>
  );
}

function useCartItems() {
  const context = useContext(CartItemsContext);
  if (context === undefined) {
    throw new Error("useCartItems must be used within a CartProvider");
  }
  return context;
}

export { CartProvider, useCartItems };
