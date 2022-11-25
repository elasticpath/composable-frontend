import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { Promotion } from "@moltin/sdk";
import { useRouter } from "next/router";

interface IPromotion extends Promotion {
  "epcc-reference-promotion-image"?: string;
}

interface IPromotionBanner {
  linkProps?: {
    link: string;
    text: string;
  };
  alignment?: "center" | "left" | "right";
  promotion: IPromotion;
}

const PromotionBanner = (props: IPromotionBanner): JSX.Element => {
  const router = useRouter();
  const { linkProps, promotion, alignment } = props;

  const { name, description } = promotion;
  const imageUrl = promotion["epcc-reference-promotion-image"];

  let background;

  if (imageUrl) {
    background = {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      _before: {
        content: "''",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        filter: "opacity(0.5)",
        zIndex: 0,
      },
    };
  } else {
    background = {
      backgroundColor: "gray.100",
    };
  }

  const contentAlignment = {
    alignItems: (() => {
      switch (alignment) {
        case "left":
          return "flex-start";
        case "right":
          return "flex-end";
        default:
          return "center";
      }
    })(),
    textAlign: alignment || "center",
  };

  return (
    <>
      {promotion && (
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          padding={8}
          position="relative"
          height="xl"
          {...contentAlignment}
          {...background}
        >
          {name && (
            <Heading as="h1" size="3xl" zIndex={1} mb={4}>
              {name}
            </Heading>
          )}
          {description && <Text zIndex={1}>{description}</Text>}
          {linkProps && (
            <Button
              bg="brand.primary"
              color="white"
              _hover={{
                backgroundColor: "brand.highlight",
                boxShadow: "lg",
              }}
              variant="solid"
              mt="5"
              zIndex={1}
              onClick={() => {
                router.push(linkProps.link);
              }}
            >
              {linkProps.text}
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

export default PromotionBanner;
