import { Flex, Button } from "@chakra-ui/react";
import { useContext } from "react";
import { changingSkuStyle, ProductContext } from "../../lib/product-util";
import { useCart } from "../../context/use-cart-hook";

interface ICartActions {
  productId: string;
}

const CartActions = ({ productId }: ICartActions): JSX.Element => {
  const context = useContext(ProductContext);
  const { addProductToCart, isUpdatingCart } = useCart();

  return (
    <Flex gap={10} {...(context?.isChangingSku ? changingSkuStyle : {})}>
      <Button
        rounded="md"
        w="full"
        mt={4}
        py="7"
        bg="brand.primary"
        color="white"
        textTransform="uppercase"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "lg",
        }}
        isLoading={isUpdatingCart}
        spinnerPlacement="end"
        disabled={isUpdatingCart || context?.isChangingSku}
        onClick={() => addProductToCart(productId, 1)}
      >
        Add to cart
      </Button>
    </Flex>
  );
};

export default CartActions;
