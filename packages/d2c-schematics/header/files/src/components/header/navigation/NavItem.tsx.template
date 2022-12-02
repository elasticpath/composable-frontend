import { Button, Menu, MenuButton, MenuList, theme } from "@chakra-ui/react";
import type { NavigationNode } from "../../../lib/build-site-navigation";
import { globalBaseWidth, styles } from "../../../styles/theme";

import NavItemContent from "./NavItemContent";

interface INavItem {
  item: NavigationNode;
  headerPadding: number;
}

const calculateOffset = (value: number, vertical: boolean = false) => {
  const rem: string = theme.sizes[value as keyof typeof theme.sizes].toString();
  const global = styles.global.html.fontSize;

  // Adjusting the offset to align correctly
  const result: number = parseFloat(rem) * parseFloat(global);
  return vertical ? result + 10 : result * 2;
};

const NavItem = ({ item, headerPadding }: INavItem): JSX.Element => {
  const menuListPadding = 4;

  return (
    <Menu
      offset={[
        -calculateOffset(menuListPadding),
        calculateOffset(headerPadding, true),
      ]}
    >
      <MenuButton
        as={Button}
        variant="link"
        marginRight="2rem"
        color="gray.800"
        _expanded={{ color: "brand.primary" }}
      >
        {item.name}
      </MenuButton>
      <MenuList
        w="100%"
        maxW={globalBaseWidth}
        p={menuListPadding}
        borderTopLeftRadius={0}
        borderTopRightRadius={0}
        sx={{
          // Workaround for https://github.com/chakra-ui/chakra-ui/issues/4276
          boxShadow: `${theme.shadows["xl"]} !important`,
        }}
      >
        <NavItemContent item={item} />
      </MenuList>
    </Menu>
  );
};

export default NavItem;
