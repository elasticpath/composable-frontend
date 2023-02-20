import { Box, Button, NumberInput, NumberInputField } from "@chakra-ui/react";
import type { CartItem } from "@moltin/sdk";
import { useCart } from "@elasticpath/react-shopper-hooks";

interface IQuantityHandler {
  item: CartItem;
}

const QuantityHandler = ({ item }: IQuantityHandler): JSX.Element => {
  const { updateCartItem } = useCart();

  return (
    <Box display="flex" justifyContent="space-around" width="120px">
      <Button
        size="sm"
        className="cartsdetailspage__arrow"
        onClick={() => {
          updateCartItem(item.id, item.quantity - 1);
        }}
      >
        -
      </Button>
      <NumberInput
        size="sm"
        width="45px"
        value={item.quantity}
        onChange={(_valueAsString: string, valueAsNumber: number) =>
          updateCartItem(item.id, valueAsNumber)
        }
        min={1}
      >
        <NumberInputField p="8px" borderRadius="md" textAlign="center" />
      </NumberInput>
      <Button
        size="sm"
        className="cartsdetailspage__arrow"
        onClick={() => {
          updateCartItem(item.id, item.quantity + 1);
        }}
      >
        +
      </Button>
    </Box>
  );
};

export default QuantityHandler;
