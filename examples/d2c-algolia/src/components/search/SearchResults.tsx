import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Divider,
  Grid,
  GridItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Box,
  Flex,
  Spacer,
  Stack,
  Checkbox,
  Badge,
  chakra,
} from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import {
  SearchBox,
  useSearchBox,
  useRefinementList,
  useSortBy,
} from "react-instantsearch-hooks-web";
import Hits from "./Hits";
import HitsPerPage from "./HitsPerPage";
import Pagination from "./Pagination";
import PriceRangeSlider from "./PriceRangeSlider";

export default function SearchResults(): JSX.Element {
  const { items, refine: catRefine } = useRefinementList({
    attribute: "ep_category_page_id",
    sortBy: ["name:asc"],
  });

  const { options, refine } = useSortBy({
    items: [
      { label: "Featured", value: "d2c-reference" },
      { label: "Price (Low to High)", value: "d2c-reference-low-to-high" },
      { label: "Price (High to Low)", value: "d2c-reference-high-to-low" },
    ],
  });

  const refinedItemCount = useMemo(
    () => items.filter((item) => item.isRefined).length,
    [items]
  );

  return (
    <Box maxW="7xl" mx="auto">
      <Divider />
      <Flex minWidth="max-content" alignItems="center" gap="2" py={4}>
        <Box p="2">
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Sort
            </MenuButton>
            <MenuList>
              {options.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => refine(option.value)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Box>
        <Spacer />
        <Stack direction="row" spacing={4}>
          <Box>
            <Menu closeOnSelect={false}>
              {({ isOpen }) => (
                <>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    Category
                    {refinedItemCount > 0 && (
                      <Badge
                        borderRadius="full"
                        px="2"
                        colorScheme={isOpen ? "teal" : "gray"}
                      >
                        {refinedItemCount}
                      </Badge>
                    )}
                  </MenuButton>
                  <MenuList>
                    <Stack spacing={2} px={4}>
                      {items.map((item) => (
                        <Checkbox
                          key={item.value}
                          isChecked={item.isRefined}
                          value={item.value}
                          onChange={(e) => {
                            console.log("value change: ", e.target.value);
                            console.log("list: ", e.target.value);
                            catRefine(e.target.value);
                          }}
                        >
                          {item.label}
                        </Checkbox>
                      ))}
                    </Stack>
                  </MenuList>
                </>
              )}
            </Menu>
          </Box>
        </Stack>
      </Flex>
      <Hits />
      <Pagination />
    </Box>
  );
}
