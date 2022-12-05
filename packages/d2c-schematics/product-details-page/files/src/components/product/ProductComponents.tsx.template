import { Fragment } from "react";
import {
  Flex,
  Box,
  RadioGroup,
  Stack,
  Radio,
  Text,
  Tag,
  Divider,
} from "@chakra-ui/react";
import { ProductResponse } from "@moltin/sdk";

interface IProductComponentsProps {
  components: ProductResponse[];
  product: ProductResponse;
}

const ProductComponents = ({
  components,
  product,
}: IProductComponentsProps): JSX.Element => {
  return (
    <Flex direction="row" flexWrap="wrap">
      {Object.keys(product.attributes.components).map((cmpName) => {
        const allOptions = product.attributes.components[cmpName].options;
        const bundle_configuration = product.meta.bundle_configuration;
        return (
          <Box key={cmpName} m="2">
            <Text mb="2">{cmpName}</Text>
            {bundle_configuration ? (
              <Box borderWidth="1px" borderRadius="lg" p="6" minW={350}>
                <RadioGroup
                  value={JSON.stringify(
                    bundle_configuration.selected_options[cmpName]
                  )}
                >
                  <Stack direction="column">
                    {allOptions.map(({ id, quantity }) => {
                      const optionData = components.find(
                        (item) => item.id === id
                      )!;
                      return (
                        <Fragment key={id}>
                          <Radio
                            position="relative"
                            key={id}
                            value={JSON.stringify({ [id]: quantity })}
                            disabled={
                              Object.keys(
                                bundle_configuration.selected_options[cmpName]
                              )[0] !== id
                            }
                          >
                            <Box
                              mt="1"
                              mb="2"
                              fontWeight="semibold"
                              as="h4"
                              lineHeight="tight"
                              noOfLines={1}
                            >
                              {optionData.attributes.name}
                            </Box>
                            <Tag
                              marginTop={4}
                              position="absolute"
                              top={0}
                              right={0}
                            >
                              {optionData.attributes.sku}
                            </Tag>
                            <Tag mb="2">Quantity: {quantity}</Tag>
                            <Text>
                              {product.meta.component_products?.[id]
                                ?.display_price.without_tax.formatted || null}
                            </Text>
                          </Radio>
                          {allOptions.length > 1 ? (
                            <Divider orientation="horizontal" />
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Flex>
  );
};

export default ProductComponents;
