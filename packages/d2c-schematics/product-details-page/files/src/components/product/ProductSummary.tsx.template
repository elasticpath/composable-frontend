import { Box, Heading, Flex } from "@chakra-ui/react";
import type { ProductResponse } from "@moltin/sdk";
import { useContext } from "react";
import { changingSkuStyle, ProductContext } from "../../lib/product-util";
import Price from "./Price";
import StrikePrice from "./StrikePrice";

interface IProductSummary {
  product: ProductResponse;
}

const ProductSummary = ({ product }: IProductSummary): JSX.Element => {
  const {
    attributes,
    meta: { display_price, original_display_price },
  } = product;
  const context = useContext(ProductContext);

  return (
    <Box as="header" {...(context?.isChangingSku ? changingSkuStyle : {})}>
      <Heading
        lineHeight={1.1}
        fontWeight={600}
        fontSize={{ base: "xl", sm: "3xl", lg: "4xl" }}
      >
        {attributes.name}
      </Heading>
      {display_price && (
        <Flex alignItems="center">
          <Price
            price={display_price.without_tax.formatted}
            currency={display_price.without_tax.currency}
          />
          {original_display_price && (
            <StrikePrice
              price={original_display_price.without_tax.formatted}
              currency={original_display_price.without_tax.currency}
            />
          )}
        </Flex>
      )}
    </Box>
  );
};

export default ProductSummary;
