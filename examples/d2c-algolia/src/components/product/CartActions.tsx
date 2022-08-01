import { useColorModeValue, Flex, Button } from "@chakra-ui/react";
import { useContext } from "react";
import { changingSkuStyle, productContext } from "../../lib/product-util";

interface ICartActions {
  handleAddToCart: () => void;
}

const CartActions = ({ handleAddToCart }: ICartActions): JSX.Element => {
  const context = useContext(productContext);
  return (
    <Flex gap={10} {...(context?.isChangingSku ? changingSkuStyle : {})}>
      <Button
        disabled={context?.isChangingSku}
        rounded={"md"}
        w={"full"}
        mt={4}
        py={"7"}
        bg={useColorModeValue("blue.900", "blue.50")}
        color={useColorModeValue("white", "gray.900")}
        textTransform={"uppercase"}
        _hover={{
          transform: "translateY(2px)",
          boxShadow: "lg",
        }}
        onClick={handleAddToCart}
      >
        Add to cart
      </Button>
    </Flex>
  );
};

export default CartActions;
