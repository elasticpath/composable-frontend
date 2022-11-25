import {
  Flex,
  Link,
  MenuGroup,
  MenuItem,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { NavigationNode } from "../../../lib/build-site-navigation";
import { ArrowForwardIcon } from "@chakra-ui/icons";

interface INavItemContent {
  item: NavigationNode;
  triggered?: () => void;
}

const menuItemInteractionStyle = {
  bg: "none",
  color: "brand.primary",
};

const menuItemStyleProps = {
  _hover: menuItemInteractionStyle,
  _active: menuItemInteractionStyle,
  _focus: menuItemInteractionStyle,
  color: "gray.500",
  margin: "1",
};

const NavItemContent = ({ item, triggered }: INavItemContent): JSX.Element => {
  const buildStack = (item: NavigationNode) => {
    return (
      <MenuGroup key={item.id} title={item.name}>
        {item.children.map((child: NavigationNode) => (
          <NextLink key={child.id} href={`/search${child.href}`} passHref>
            <MenuItem
              as={Link}
              {...menuItemStyleProps}
              fontSize="sm"
              onClick={triggered}
            >
              {child.name}
            </MenuItem>
          </NextLink>
        ))}
        <NextLink href={`/search${item.href}`} passHref>
          <MenuItem
            as={Link}
            fontSize="sm"
            fontWeight="semibold"
            {...menuItemStyleProps}
            onClick={triggered}
          >
            Browse All
          </MenuItem>
        </NextLink>
      </MenuGroup>
    );
  };

  return (
    <Flex flexDirection="column">
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 4 }}
        spacing={10}
        borderBottom="1px solid"
        borderColor="gray.100"
        paddingBottom={2}
      >
        {item.children.map((parent: NavigationNode, index: number) => {
          return <div key={index}>{buildStack(parent)}</div>;
        })}
      </SimpleGrid>
      <NextLink href={`/search${item.href}`} passHref>
        <Link
          m={4}
          marginBottom={0}
          fontSize="sm"
          fontWeight="semibold"
          onClick={triggered}
        >
          <Text
            display="flex"
            flexDirection="row"
            alignItems="center"
            _hover={{ color: "brand.primary" }}
          >
            Browse All {item.name}
            <ArrowForwardIcon marginLeft={1} />
          </Text>
        </Link>
      </NextLink>
    </Flex>
  );
};

export default NavItemContent;
