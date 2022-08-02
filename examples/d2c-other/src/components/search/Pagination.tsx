import React from "react";
import { Box, Button, HStack } from "@chakra-ui/react";
import { usePagination } from "react-instantsearch-hooks-web";

export const Pagination = (): JSX.Element => {
  const { pages, currentRefinement, canRefine, refine } = usePagination();

  return (
    <Box display={canRefine ? "block" : "none"}>
      <HStack justify="center">
        {pages.map((page) => (
          <Button
            key={page}
            bg={currentRefinement === page ? "blue.900" : "gray.100"}
            onClick={() => refine(page)}
            disabled={!canRefine}
            color={currentRefinement === page ? "white" : "black"}
            _hover={{
              backgroundColor: "blue.700",
              boxShadow: "m",
              color: "white",
            }}
            variant="solid"
          >
            {page + 1}
          </Button>
        ))}
      </HStack>
    </Box>
  );
};

export default Pagination;
