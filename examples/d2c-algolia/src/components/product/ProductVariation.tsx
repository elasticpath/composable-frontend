import {
  Button,
  ButtonProps,
  Flex,
  Grid,
  useColorModeValue,
} from "@chakra-ui/react";

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

const ProductVariation = ({
  variation,
  selectedOptionId,
  updateOptionHandler,
}: IProductVariation): JSX.Element => {
  const buttonHighlightStyle: ButtonProps = {
    bgColor: useColorModeValue("blue.900", "blue.50"),
    color: useColorModeValue("white", "gray.900"),
  };

  const buttonStandardStyle: ButtonProps = {
    bgColor: useColorModeValue("white", "blue.900"),
    color: useColorModeValue("gray.900", "white"),
  };

  return (
    <Grid>
      <h2>{variation.name}</h2>
      <Flex gap={2} wrap={"wrap"}>
        {variation.options.map((o) => (
          <Button
            key={o.id}
            {...(o.id === selectedOptionId
              ? buttonHighlightStyle
              : buttonStandardStyle)}
            border={"1px solid"}
            borderColor="gray.200"
            onClick={() => updateOptionHandler(variation.id)(o.id)}
          >
            {o.name}
          </Button>
        ))}
      </Flex>
    </Grid>
  );
};

export default ProductVariation;
