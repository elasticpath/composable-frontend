import { useSearchBox } from "react-instantsearch-hooks-web";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import { useDebouncedEffect } from "../../lib/use-debounced";

export default function SearchBox(): JSX.Element {
  const { query, refine, clear } = useSearchBox();
  const [search, setSearch] = useState<string>(query);

  useDebouncedEffect(
    () => {
      if (search !== query) {
        refine(search);
      }
    },
    400,
    [search]
  );

  return (
    <InputGroup bgColor="gray.50" rounded="lg">
      <InputLeftElement h="12" pl="4" pointerEvents="none">
        <SearchIcon color="gray.300" />
      </InputLeftElement>
      <Input
        h="12"
        pl="12"
        outline="0"
        border="0"
        boxShadow="none"
        _focus={{ boxShadow: "none" }}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        placeholder="Search"
      />
      <InputRightElement
        width="4.5rem"
        h="12"
        visibility={query ? "visible" : "hidden"}
      >
        <IconButton
          aria-label="Search database"
          icon={<CloseIcon />}
          variant="ghost"
          onClick={() => {
            clear();
            setSearch("");
          }}
        />
      </InputRightElement>
    </InputGroup>
  );
}
