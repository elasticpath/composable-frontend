import { useState, useEffect } from "react";
import { updateCartItem } from "../../services/cart";
import { useCartItems } from "../../context/cart";
import { Box, Button, NumberInput, NumberInputField } from "@chakra-ui/react";
import type { CartItem } from "@moltin/sdk";

interface IQuantityHandler {
  item: CartItem;
  size: string; // TODO should probably be constrained further e.g. union type of "sm" | "md" | "lg"
}

const QuantityHandler = ({ item, size }: IQuantityHandler): JSX.Element => {
  const { updateCartItems } = useCartItems();
  const [mcart, setMcart] = useState("");

  useEffect(() => {
    const cart = localStorage.getItem("mcart") || "";
    setMcart(cart);
  });

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateCartItem(mcart, id, quantity)
      .then(() => {
        updateCartItems();
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <Box
      display="flex"
      justifyContent="space-around"
      alignItems="center"
      width={size === "xs" ? "120px" : "160px"}
    >
      <Button
        size={size}
        className="cartsdetailspage__arrow"
        onClick={() => {
          handleUpdateQuantity(item.id, item.quantity - 1);
        }}
      >
        -
      </Button>
      <NumberInput
        size={size}
        width={size === "xs" ? "60px" : "80px"}
        value={item.quantity}
        onChange={(_valueAsString: string, valueAsNumber: number) =>
          handleUpdateQuantity(item.id, valueAsNumber)
        }
        min={1}
      >
        <NumberInputField p="8px" borderRadius="md" />
      </NumberInput>
      <Button
        size={size}
        className="cartsdetailspage__arrow"
        onClick={() => {
          handleUpdateQuantity(item.id, item.quantity + 1);
        }}
      >
        +
      </Button>
    </Box>
  );
};

export default QuantityHandler;
