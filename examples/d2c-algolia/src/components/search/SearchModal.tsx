import React, {
  DependencyList,
  EffectCallback,
  useEffect,
  useState,
} from "react";
import {
  InstantSearch,
  useHits,
  useSearchBox,
} from "react-instantsearch-hooks-web";
import {
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  LinkBox,
  LinkOverlay,
  ListItem,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import NoResults from "./NoResults";
import NoImage from "./NoImage";
import { SearchHit } from "./SearchHit";
import { jsx } from "@emotion/react";
import JSX = jsx.JSX;
import { searchClient } from "../../lib/search-client";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";

export const useDebouncedEffect = (
  effect: EffectCallback,
  delay: number,
  deps?: DependencyList
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
  }, [...(deps || []), delay, effect]);
};

const SearchBox = ({
  onChange,
  onSearchEnd,
}: {
  onChange: (value: string) => void;
  onSearchEnd: (query: string) => void;
}) => {
  const { query, refine, clear } = useSearchBox();
  const [search, setSearch] = useState<string>(query);

  useDebouncedEffect(() => refine(search), 400, [search]);

  return (
    <InputGroup>
      <InputLeftElement h="16" pl="8" pointerEvents="none">
        <SearchIcon color="gray.300" />
      </InputLeftElement>
      <Input
        h="16"
        pl="16"
        outline="0"
        border="0"
        boxShadow="none"
        _focus={{ boxShadow: "none" }}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          onChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSearchEnd(search);
          }
        }}
        placeholder="Search"
      />
      <InputRightElement
        width="4.5rem"
        h="16"
        visibility={query ? "visible" : "hidden"}
      >
        <IconButton
          aria-label="Search database"
          icon={<CloseIcon />}
          onClick={() => {
            clear();
            onChange("");
            setSearch("");
          }}
        />
      </InputRightElement>
    </InputGroup>
  );
};

const HitComponent = ({ hit }: { hit: SearchHit }) => {
  const { ep_price, ep_image_url, ep_name, ep_sku, ep_slug, objectID } = hit;
  return (
    <LinkBox>
      <Grid
        h="100px"
        templateRows="repeat(3, 1fr)"
        templateColumns="repeat(6, 1fr)"
        gap={2}
      >
        <GridItem rowSpan={3} colSpan={2}>
          {ep_image_url ? (
            <Image
              boxSize="100px"
              objectFit="cover"
              src={ep_image_url}
              alt={ep_name}
            />
          ) : (
            <NoImage />
          )}
        </GridItem>
        <GridItem colSpan={4}>
          <Heading size="sm">
            <LinkOverlay href={`/products/${ep_slug}/${objectID}`}>
              {ep_name}
            </LinkOverlay>
          </Heading>
        </GridItem>
        <GridItem colSpan={4}>
          <Text
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
          >
            {ep_sku}
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text fontSize="sm" fontWeight="semibold">
            {ep_price}
          </Text>
        </GridItem>
      </Grid>
    </LinkBox>
  );
};

const Hits = () => {
  const { hits } = useHits<SearchHit>();

  if (hits.length) {
    return (
      <UnorderedList listStyleType="none" marginInlineStart="0">
        {hits.map((hit) => (
          <ListItem mb="4" key={hit.objectID}>
            <HitComponent hit={hit} />
          </ListItem>
        ))}
      </UnorderedList>
    );
  }
  return <NoResults />;
};

export const SearchModal = (): JSX.Element => {
  const [searchValue, setSearchValue] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={algoliaEnvData.indexName}
    >
      <Button
        onClick={onOpen}
        fontWeight="normal"
        border={"1px solid"}
        borderColor="gray.300"
        color="gray.400"
        width="200px"
        justifyContent="left"
      >
        <SearchIcon color="gray.400" mr="4" />
        Search
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxH="calc(100% - 7.5rem)">
          <SearchBox
            onChange={(value: string) => {
              setSearchValue(value);
            }}
            onSearchEnd={(query) => {
              onClose();
              setSearchValue("");
              router.push({
                pathname: "/search",
                query: { search: query },
              });
            }}
          />
          {searchValue ? (
            <Box overflowX="scroll" px="4" pb="4">
              <Divider />
              <Box mt="4">
                <Hits />
              </Box>
            </Box>
          ) : null}
        </ModalContent>
      </Modal>
    </InstantSearch>
  );
};

export default SearchModal;
