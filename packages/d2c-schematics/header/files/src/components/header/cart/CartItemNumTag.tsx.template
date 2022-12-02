import { PresentCartState } from "@field123/epcc-react";
import { Tag, TagLabel } from "@chakra-ui/react";

export default function CartItemNumTag({
  state,
}: {
  state: PresentCartState;
}): JSX.Element {
  return (
    <Tag
      display="flex"
      justifyContent="center"
      borderRadius="full"
      bgColor="brand.primary"
      variant="solid"
      position="absolute"
      size="sm"
      top={0}
      right={0.5}
      padding="0px"
      width="20px"
      height="20px"
    >
      <TagLabel fontSize="10px" fontWeight="500">
        {state.items.length}
      </TagLabel>
    </Tag>
  );
}
