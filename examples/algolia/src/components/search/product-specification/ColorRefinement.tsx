import { useRefinementList } from "react-instantsearch-hooks-web";
import { Box, Button, Flex, Heading } from "@chakra-ui/react";

const ColorRefinement = ({ attribute }: { attribute: string }) => {
  const { items, refine } = useRefinementList({ attribute });

  return (
    <>
      <Heading as="h3" size="sm" mt={5} pb={1}>
        Color
      </Heading>
      <Flex gap={2} wrap="wrap" alignItems="center">
        {items.map((o) => (
          <Box
            key={o.value}
            p="0.5"
            {...(o.isRefined
              ? {
                  border: "2px solid",
                  borderColor: "brand.primary",
                }
              : {})}
            rounded="full"
          >
            <Button
              border="1px solid"
              borderColor="gray.200"
              _hover={{}}
              _active={{}}
              bgColor={o.value}
              p="4"
              rounded="full"
              onClick={() => refine(o.value)}
            />
          </Box>
        ))}
      </Flex>
    </>
  );
};

export default ColorRefinement;
