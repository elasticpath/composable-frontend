import { Flex } from "@chakra-ui/react";
import type { NavigationNode } from "../../../lib/build-site-navigation";

import NavItem from "./NavItem";

interface INavBar {
  nav: NavigationNode[];
  headerPadding: number;
}

const NavBar = ({ nav, headerPadding }: INavBar): JSX.Element => {
  return (
    <Flex w="100%" as="nav">
      {nav &&
        nav.map((item: NavigationNode) => (
          <NavItem key={item.id} item={item} headerPadding={headerPadding} />
        ))}
    </Flex>
  );
};

export default NavBar;
