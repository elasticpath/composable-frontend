import React from "react";
import { Box, Square, Stack, Text } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export const NoResults = ({
  displayIcon = true,
}: {
  displayIcon?: boolean;
}): JSX.Element => {
  return (
    <Box p="8">
      <Stack align="center">
        {displayIcon ? (
          <Square size="100px" bg="gray.200" color="white" mb="4">
            <SearchIcon w="10" h="10" />
          </Square>
        ) : null}
        <Text>No matching results</Text>
      </Stack>
    </Box>
  );
};

export default NoResults;
