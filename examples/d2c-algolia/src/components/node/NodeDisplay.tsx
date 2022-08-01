import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Flex,
  Text,
  Box,
  Link,
  Heading,
  Stack,
  Grid,
  GridItem,
  GridItemProps,
  Skeleton,
  SkeletonProps,
} from "@chakra-ui/react";
import { Node } from "@moltin/sdk";
import { getNodes, getNodeChildren } from "../../services/hierarchy";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";

interface INodeDisplayBase {
  title: string;
  linkProps?: {
    link: string;
    text: string;
  };
}

interface INodeDisplayFetchNode extends INodeDisplayBase {
  type: "fetch-node";
  nodeId: string;
}

interface INodeDisplayFetchHierarchy extends INodeDisplayBase {
  type: "fetch-hierarchy";
  hierarchyId: string;
}

interface INodeDisplayProvidedNode extends INodeDisplayBase {
  type: "provided";
  nodes: Node[];
}

type INodeDisplay =
  | INodeDisplayFetchNode
  | INodeDisplayFetchHierarchy
  | INodeDisplayProvidedNode;

const gridItemStyles: GridItemProps[] = [
  {
    rowSpan: 2,
    /**
     * padding-bottom trick for aspect ratio boxes
     * see - https://css-tricks.com/aspect-ratio-boxes/
     * calc(aspectH / aspectW * 100%)
     */
    pb: { base: "50%", md: "100%" },
  },
  {
    pb: { base: "50%", md: "0" },
    rowSpan: "auto",
  },
  {
    pb: { base: "50%", md: "0" },
    rowSpan: "auto",
  },
];

const skeletonItemStyles: SkeletonProps[] = [
  {
    startColor: "blue.500",
    endColor: "blue.400",
    rounded: "25px",
    height: { base: "175px", md: "435px" },
  },
  {
    startColor: "blue.500",
    endColor: "blue.400",
    rounded: "25px",
    height: { base: "175px", md: "200px" },
  },
  {
    startColor: "blue.500",
    endColor: "blue.400",
    rounded: "25px",
    height: { base: "175px", md: "200px" },
  },
];

export default function NodeDisplay(props: INodeDisplay): JSX.Element {
  const router = useRouter();
  const { title, linkProps, type } = props;
  const [nodes, setNodes] = useState<Node[]>(
    type === "provided" ? props.nodes : []
  );

  const fetchTopThreeNodes = useCallback(async () => {
    if (type === "fetch-hierarchy" || type === "fetch-node") {
      const allNodes = await (type === "fetch-node"
        ? getNodeChildren(props.nodeId)
        : getNodes(props.hierarchyId));

      // Only need the top three nodes
      const topThreeNodes: Node[] = allNodes.slice(0, 3);

      setNodes(topThreeNodes);
    }
  }, [type, props]);

  useEffect(() => {
    try {
      fetchTopThreeNodes();
    } catch (error) {
      console.log(error);
    }
  }, [fetchTopThreeNodes]);

  return (
    <Stack bg={"#FFAFB"} display={"flex"} maxW={"80rem"} mx="auto">
      <Flex
        justifyContent={"space-between"}
        alignItems={"baseline"}
        direction={{ base: "column", sm: "row" }}
      >
        <Heading
          as={"h2"}
          fontSize={{ base: "1.1rem", md: "1.3rem", lg: "1.5rem" }}
          fontWeight={"extrabold"}
        >
          {title}
        </Heading>
        {linkProps && (
          <Link
            color={"#0033CC"}
            fontWeight={"bold"}
            fontSize={{ base: "sm", md: "md", lg: "lg" }}
            onClick={() => {
              linkProps.link && router.push(linkProps.link);
            }}
          >
            {linkProps.text} <ArrowForwardIcon color={"inherit"} />
          </Link>
        )}
      </Flex>
      <Grid
        gap={{ lg: 8 }}
        columnGap={{ md: 6 }}
        rowGap={{ base: "1.5rem", md: "6" }}
        templateRows={{
          base: "repeat(1,minmax(0,1fr)",
          md: `repeat(${nodes.length === 1 ? "1" : "2"}, minmax(0,1fr))`,
        }}
        templateColumns={{
          base: "repeat(1,minmax(0,1fr)",
          md: "repeat(2, minmax(0,1fr))",
        }}
        pb={"1em"}
        px={"1em"}
      >
        {nodes.length > 0 ? (
          nodes.map((node, i) => {
            return (
              <GridItem
                position={"relative"}
                key={`node-${node.id}`}
                rounded={"lg"}
                overflow={"hidden"}
                {...gridItemStyles[i]}
                {...(nodes.length === 1 && {
                  gridColumn: "1 / -1",
                  rowSpan: 1,
                  pb: { base: "65%", md: "50%" },
                })}
                {...(nodes.length === 2 && {
                  ...gridItemStyles[0],
                })}
              >
                <Box
                  position={"absolute"}
                  w={"100%"}
                  h={"100%"}
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bgGradient="linear(to-r, gray.300, blue.500)"
                  _hover={{ opacity: "75%", cursor: "pointer" }}
                  // placeholder url for categories page
                  onClick={() => router.push(`/category/${node.id}`)}
                />
                <Flex
                  fontWeight={"bold"}
                  bottom={"1rem"}
                  left={"2rem"}
                  zIndex={"100"}
                  position="absolute"
                  flexDirection={"column"}
                  justifyContent={"space-between"}
                >
                  <Heading fontSize={{ base: "md", md: "1.3rem", lg: "lg" }}>
                    {node.attributes.name}
                  </Heading>
                  <Text
                    fontWeight={"initial"}
                    fontSize={{ base: "sm", md: "0.9rem", lg: "1.1rem" }}
                  >
                    {node.attributes.description}
                  </Text>
                </Flex>
              </GridItem>
            );
          })
        ) : (
          <>
            {skeletonItemStyles &&
              skeletonItemStyles.map((skeletonProps, index) => {
                return index === 0 ? (
                  <GridItem rowSpan={2}>
                    <Skeleton {...skeletonProps} />
                  </GridItem>
                ) : (
                  <Skeleton {...skeletonProps} />
                );
              })}
          </>
        )}
      </Grid>
    </Stack>
  );
}
