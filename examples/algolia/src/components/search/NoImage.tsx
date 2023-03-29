import React from "react";
import { Square } from "@chakra-ui/react";
import { ViewOffIcon } from "@chakra-ui/icons";

export const NoImage = (): JSX.Element => {
  return (
    <Square size="100px" bg="gray.200" color="white">
      <ViewOffIcon w="10" h="10" />
    </Square>
  );
};

export default NoImage;
