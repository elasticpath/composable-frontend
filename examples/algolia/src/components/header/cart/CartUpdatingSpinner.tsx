import { Spinner } from "@chakra-ui/react";

export default function CartUpdatingSpinner(): JSX.Element {
  return (
    <Spinner
      display="flex"
      justifyContent="center"
      alignContent="center"
      variant="solid"
      position="absolute"
      color="brand.primary"
      top={1}
      right={1.5}
      padding="0px"
      zIndex={2}
      size="xs"
    />
  );
}
