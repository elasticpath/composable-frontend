import { RefinedCartItem } from "@elasticpath/react-shopper-hooks";
import { Box, Text, Grid, GridItem, IconButton } from "@chakra-ui/react";
import QuantityHandler from "../quantity-handler/QuantityHandler";
import { CloseIcon } from "@chakra-ui/icons";
import { NonEmptyArray } from "../../lib/types/non-empty-array";
import { ReadonlyNonEmptyArray } from "../../lib/types/read-only-non-empty-array";
import { ChakraNextImage } from "../ChakraNextImage";

export function CartItemList({
  items,
  handleRemoveItem,
}: {
  items:
    | RefinedCartItem[]
    | NonEmptyArray<RefinedCartItem>
    | ReadonlyNonEmptyArray<RefinedCartItem>;
  handleRemoveItem: (itemId: string) => Promise<void>;
}): JSX.Element {
  return (
    <Box>
      {items.map((item) => (
        <Grid
          key={item.id}
          gridTemplateColumns={{ base: "auto 1fr auto" }}
          gap={6}
          py={10}
          borderBottom="1px solid"
          borderColor="gray.200"
          _last={{ border: "none" }}
          _first={{ borderTop: "1px solid", borderColor: "gray.200" }}
        >
          <Box>
            {item.image?.href && (
              <ChakraNextImage
                src={item.image.href}
                alt={item.name}
                width={192}
                height={192}
                w={{ base: "5rem", sm: "12rem" }}
                h={{ base: "5rem", sm: "12rem" }}
                overflow="hidden"
                rounded="lg"
              />
            )}
          </Box>

          <Grid
            gridTemplateRows={{ base: "auto 1fr", md: "" }}
            gridTemplateColumns={{ base: "", md: "1fr 1fr" }}
            gap={{ base: 4, md: 6 }}
          >
            <GridItem>
              <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                {item.name}
              </Text>
              <Text fontSize="md" fontWeight="medium" mt={2}>
                {item.meta.display_price.without_tax.unit.formatted}
              </Text>
            </GridItem>
            <QuantityHandler item={item} />
          </Grid>
          <GridItem>
            <IconButton
              aria-label="Remove"
              color="gray.500"
              icon={<CloseIcon w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />}
              variant="text"
              _hover={{ color: "gray.700" }}
              onClick={() => {
                handleRemoveItem(item.id);
              }}
            />
          </GridItem>
        </Grid>
      ))}
    </Box>
  );
}
