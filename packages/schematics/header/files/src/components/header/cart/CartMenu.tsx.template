import {
  Box,
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import ModalCartItems from "./ModalCartItem";
import { Icon } from "@chakra-ui/icons";
import { CartState, useCart } from "@field123/epcc-react";
import CartUpdatingSpinner from "./CartUpdatingSpinner";
import CartItemNumTag from "./CartItemNumTag";

export default function CartMenu(): JSX.Element {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { state } = useCart();

  return (
    <Popover
      placement="top-end"
      onClose={onClose}
      isOpen={isOpen}
      onOpen={onOpen}
    >
      <PopoverTrigger>
        <Button variant="ghost" _focus={{ border: "none" }}>
          <Icon
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            h={6}
            w={6}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </Icon>
          {(state.kind === "updating-cart-state" ||
            state.kind === "loading-cart-state" ||
            state.kind === "uninitialised-cart-state") && (
            <CartUpdatingSpinner />
          )}
          {state.kind === "present-cart-state" && (
            <CartItemNumTag state={state} />
          )}
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent borderRadius={8} mt={4} boxShadow="2xl">
          <PopoverBody height="sm" overflowY="auto" p={4}>
            <ModalCartItems />
          </PopoverBody>
          <PopoverFooter p={4}>
            <CartPopoverFooter state={state} onClose={onClose} />
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

function CartPopoverFooter({
  state,
  onClose,
}: {
  state: CartState;
  onClose: () => void;
}): JSX.Element {
  const checkoutHref =
    state.kind === "present-cart-state" ? `/checkout/${state.id}` : "#";
  const hasCartItems = state.kind === "present-cart-state";
  return (
    <Box>
      <Link href={checkoutHref} passHref>
        <Button
          disabled={!hasCartItems}
          onClick={onClose}
          bg="brand.primary"
          color="white"
          w="100%"
          display="block"
          _hover={{
            backgroundColor: "brand.highlight",
            boxShadow: "m",
          }}
          variant="solid"
        >
          Checkout
        </Button>
      </Link>
      <Link href="/cart" passHref>
        <Button
          onClick={onClose}
          _hover={{
            color: "brand.primary",
          }}
          m="10px auto auto"
          display="block"
          variant="text"
        >
          View cart
        </Button>
      </Link>
    </Box>
  );
}
