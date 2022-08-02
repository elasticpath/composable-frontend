import React from "react";
import {
  Flex,
  Text,
  Box,
  Menu,
  useColorModeValue,
  MenuButton,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import NavHoverBox from "./NavHoverBox";

interface INavItem {
  title: string;
  id: string;
}

export default function NavItem({ title, id }: INavItem) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex>
      <Menu isOpen={isOpen}>
        <MenuButton
          w="100%"
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
          px={2}
          py={1}
          rounded={"md"}
          _hover={{
            textDecoration: "none",
            bg: useColorModeValue("gray.200", "gray.700"),
          }}
        >
          <Flex>
            <Text>{title}</Text>
          </Flex>
        </MenuButton>
        <Box>
          <MenuList onMouseEnter={onOpen} onMouseLeave={onClose} p={4}>
            <NavHoverBox id={id} />
          </MenuList>
        </Box>
      </Menu>
    </Flex>
  );
}
