import {
  Box,
  Text,
  Stack,
  StackDivider,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ProductResponse } from "@moltin/sdk";
import { useContext } from "react";
import { changingSkuStyle, ProductContext } from "../../lib/product-util";

interface IProductDetails {
  product: ProductResponse;
}

const ProductDetails = ({ product }: IProductDetails): JSX.Element => {
  const context = useContext(ProductContext);

  return (
    <Stack
      spacing={{ base: 4, sm: 6 }}
      direction="column"
      divider={
        <StackDivider borderColor={useColorModeValue("gray.200", "gray.800")} />
      }
      {...(context?.isChangingSku ? changingSkuStyle : {})}
    >
      <Box>
        <Text
          fontSize={{ base: "16px", lg: "18px" }}
          color="gray.800"
          fontWeight="500"
          textTransform="uppercase"
          mb="4"
        >
          Product Details
        </Text>
        <Text>{product.attributes.description}</Text>
      </Box>
    </Stack>
  );
};

export default ProductDetails;
