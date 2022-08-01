import React, { useState, useEffect } from "react";
import { getHierarchies } from "../../services/hierarchy";
import {
  Button,
  Tag,
  TagLabel,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  PopoverFooter,
  Grid,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import { Box, Flex, HStack, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import ModalCartItems from "../cartItems/ModalCartItem";
import NavItem from "./NavItem";
import type { Hierarchy } from "@moltin/sdk";
import { useCartItems } from "../../context/cart";
import SearchModal from "../search/SearchModal";

export default function MainMenu() {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [menu, setMenu] = useState<Hierarchy[]>([]);
  const { cartData } = useCartItems();

  useEffect(() => {
    async function fetchHierarchies() {
      const hierarchy = await getHierarchies();
      setMenu(hierarchy);
    }
    try {
      fetchHierarchies();
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <Box
      bg={useColorModeValue("gray.100", "gray.900")}
      p={2}
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Flex alignItems={"center"} justifyContent={"space-between"} />
      <HStack spacing={8} alignItems={"center"}>
        <Box cursor="pointer">
          <Link href="/" passHref>
            <a>
              <Image
                src="/icons/ep-logo.svg"
                alt="ep Logo"
                width={120}
                height={32}
              />
            </a>
          </Link>
        </Box>
        <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
          {menu.map((hierarchy) => {
            return (
              <NavItem
                key={hierarchy.id}
                title={hierarchy.attributes.name}
                id={hierarchy.id}
              />
            );
          })}
        </HStack>
        <HStack pos="absolute" right="8px">
          <SearchModal />
          <Box>
            <Popover onClose={onClose} isOpen={isOpen} onOpen={onOpen}>
              <PopoverTrigger>
                <Button _focus={{ border: "none" }}>
                  <Image
                    src="/icons/cart-main.png"
                    alt="Vercel Logo"
                    width={18}
                    height={23}
                    objectFit="contain"
                  />
                  <Tag
                    display="flex"
                    justifyContent="center"
                    colorScheme="red"
                    borderRadius="full"
                    variant="solid"
                    size="sm"
                    position="absolute"
                    top="0px"
                    right="2px"
                    padding="0px"
                    width="20px"
                    height="20px"
                  >
                    <TagLabel fontSize="10px" fontWeight="500">
                      {cartData.reduce((pre, current) => {
                        return pre + current.quantity;
                      }, 0)}
                    </TagLabel>
                  </Tag>
                </Button>
              </PopoverTrigger>
              <Portal>
                <PopoverContent boxShadow="2xl" _focus={{ border: "none" }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader pt={4} fontWeight="bold" border="0">
                    Your Shopping Cart
                  </PopoverHeader>
                  <PopoverBody
                    height={cartData && cartData.length ? "450px" : "250px"}
                    overflow="scroll"
                  >
                    <ModalCartItems />
                  </PopoverBody>
                  <PopoverFooter>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      <Link href={"/cart"} passHref>
                        <Button
                          onClick={onClose}
                          _hover={{
                            color: "blue.700",
                            boxShadow: "lg",
                          }}
                          colorScheme={useColorModeValue("blue.900", "blue.50")}
                          variant="outline"
                        >
                          View cart
                        </Button>
                      </Link>
                      <Link href={"/checkout"} passHref>
                        <Button
                          disabled={cartData.length === 0}
                          onClick={onClose}
                          bg={useColorModeValue("blue.900", "blue.50")}
                          color={useColorModeValue("white", "gray.900")}
                          _hover={{
                            backgroundColor: "blue.700",
                            boxShadow: "m",
                          }}
                          variant="solid"
                        >
                          Checkout
                        </Button>
                      </Link>
                    </Grid>
                  </PopoverFooter>
                </PopoverContent>
              </Portal>
            </Popover>
          </Box>
        </HStack>
      </HStack>
    </Box>
  );
}
