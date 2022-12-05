import { Button, ButtonProps, Flex, Grid } from "@chakra-ui/react";

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

const ProductVariationStandard = ({
  variation,
  selectedOptionId,
  updateOptionHandler,
}: IProductVariation): JSX.Element => {
  const buttonHighlightStyle: ButtonProps = {
    bgColor: "brand.primary",
    color: "white",
  };

  const buttonStandardStyle: ButtonProps = {
    bgColor: "white",
    color: "gray.800",
  };

  return (
    <Grid gap={2}>
      <h2>{variation.name}</h2>
      <Flex gap={2} wrap="wrap">
        {variation.options.map((o) => (
          <Button
            key={o.id}
            {...(o.id === selectedOptionId
              ? buttonHighlightStyle
              : buttonStandardStyle)}
            border="1px solid"
            borderColor="gray.200"
            p="6"
            onClick={() => updateOptionHandler(variation.id)(o.id)}
          >
            {o.name}
          </Button>
        ))}
      </Flex>
    </Grid>
  );
};

export default ProductVariationStandard;
