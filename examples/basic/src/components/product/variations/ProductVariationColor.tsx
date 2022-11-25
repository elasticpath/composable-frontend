import { Box, Button, Flex, Grid } from "@chakra-ui/react";
import { colorLookup } from "../../../lib/color-lookup";

interface ProductVariationOption {
  id: string;
  description: string;
  name: string;
}

export type UpdateOptionHandler = (
  variationId: string
) => (optionId: string) => void;

interface IProductVariation {
  variation: {
    id: string;
    name: string;
    options: ProductVariationOption[];
  };
  updateOptionHandler: UpdateOptionHandler;
  selectedOptionId?: string;
}

const ProductVariationColor = ({
  variation,
  selectedOptionId,
  updateOptionHandler,
}: IProductVariation): JSX.Element => {
  return (
    <Grid gap={2}>
      <h2>{variation.name}</h2>
      <Flex gap={2} wrap="wrap" alignItems="center">
        {variation.options.map((o) => (
          <Box
            key={o.id}
            p="0.5"
            {...(o.id === selectedOptionId
              ? {
                  border: "2px solid",
                  borderColor: "brand.primary",
                }
              : {})}
            rounded="full"
          >
            <Button
              border="1px solid"
              borderColor="gray.200"
              _hover={{}}
              _active={{}}
              bgColor={colorLookup[o.name.toLowerCase()]}
              p="4"
              rounded="full"
              onClick={() => updateOptionHandler(variation.id)(o.id)}
            />
          </Box>
        ))}
      </Flex>
    </Grid>
  );
};

export default ProductVariationColor;
