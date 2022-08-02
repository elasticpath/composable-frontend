import React, { useEffect, useState } from "react";
import { getNodes } from "../../services/hierarchy";
import type { Node } from "@moltin/sdk";
import { Box, useColorModeValue } from "@chakra-ui/react";
import Link from "next/link";

interface INavHoverBox {
  id: string;
}

export default function NavHoverBox({ id }: INavHoverBox) {
  const [subMenu, setSubMenu] = useState<Node[]>([]);

  useEffect(() => {
    async function fetchNodes() {
      const hierarchy = await getNodes(id);
      setSubMenu(hierarchy);
    }
    try {
      fetchNodes();
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  const color = useColorModeValue("gray.500", "gray.800");
  return (
    <>
      {subMenu.map((node) => {
        return (
          <Box
            key={node.id}
            p="5px"
            _hover={{
              textDecoration: "none",
              fontWeight: "500",
              color,
            }}
          >
            <Link href={`/category/${node.id}`}>{node.attributes.name}</Link>
          </Box>
        );
      })}
    </>
  );
}
