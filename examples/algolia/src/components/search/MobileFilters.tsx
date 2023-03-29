import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  useDisclosure,
} from "@chakra-ui/react";
import CustomHierarchicalMenu from "./CustomHierarchicalMenu";
import { hierarchicalAttributes } from "../../lib/hierarchical-attributes";
import { BreadcrumbLookup } from "../../lib/types/breadcrumb-lookup";
import {
  InstantSearch,
  usePagination,
  useSearchBox,
  useSortBy,
} from "react-instantsearch-hooks-web";
import { searchClient } from "../../lib/search-client";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface IMobileFilters {
  lookup?: BreadcrumbLookup;
  NextRouterHandler: any;
}

export default function MobileFilters({
  lookup,
  NextRouterHandler,
}: IMobileFilters): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const VirtualSearchBox = () => {
    useSearchBox();
    return null;
  };
  const VirtualPagination = () => {
    usePagination();
    return null;
  };
  const VirtualSortBy = () => {
    useSortBy({ items: [] });
    return null;
  };

  return (
    <Box display={{ base: "block", md: "none" }}>
      <Button variant="ghost" rightIcon={<ChevronDownIcon />} onClick={onOpen}>
        Filters
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filters</DrawerHeader>

          <DrawerBody>
            <InstantSearch
              searchClient={searchClient}
              indexName={algoliaEnvData.indexName}
            >
              <VirtualSearchBox />
              <VirtualPagination />
              <VirtualSortBy />
              <NextRouterHandler />
              <Heading as="h3" size="sm" pb={2}>
                Category
              </Heading>
              <CustomHierarchicalMenu
                lookup={lookup}
                attributes={hierarchicalAttributes}
              />
            </InstantSearch>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
