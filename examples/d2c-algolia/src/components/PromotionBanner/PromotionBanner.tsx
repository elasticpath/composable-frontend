import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Button, Heading, Skeleton, Text } from "@chakra-ui/react";
import { getPromotionById } from "../../services/promotions-api";
import { Promotion } from "@moltin/sdk";
import { useRouter } from "next/router";

interface PromotionBannerBase {
  linkProps?: {
    link: string;
    text: string;
  };
}

interface PromotionBannerFetch extends PromotionBannerBase {
  type: "fetch";
  id: string;
}

interface PromotionBannerProvided extends PromotionBannerBase {
  type: "provided";
  promotion: Promotion;
}

type IPromotionBanner = PromotionBannerFetch | PromotionBannerProvided;

const basicBoxStyles = {
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  position: "relative",
  height: "400px",
  backgroundImage: "linear-gradient(#0033CCad, #CBD5F400)",
};

const textBoxStyles = {
  textAlign: "center",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "black",
};

const PromotionBanner = (props: IPromotionBanner): JSX.Element => {
  const router = useRouter();
  const { linkProps, type } = props;

  const [promotionData, setPromotionData] = useState<Promotion | undefined>(
    type === "provided" ? props.promotion : undefined
  );

  const fetchPromotion = useCallback(async () => {
    if (type === "fetch") {
      const { data } = await getPromotionById(props.id);
      setPromotionData(data);
    }
  }, [setPromotionData, type, props]);

  useEffect(() => {
    try {
      fetchPromotion();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [fetchPromotion]);

  const { name, description } = promotionData || {};

  return (
    <>
      {
        <Box sx={basicBoxStyles}>
          <Box sx={textBoxStyles}>
            {name ? (
              <Heading as="h1" size="4xl">
                {name}
              </Heading>
            ) : (
              <Skeleton
                marginBottom="2"
                startColor="blue.500"
                endColor="blue.400"
                height="72px"
              />
            )}
            {description ? (
              <Text>{description}</Text>
            ) : (
              <Skeleton
                startColor="blue.500"
                endColor="blue.400"
                height="24px"
              />
            )}
            {linkProps && (
              <Button
                width="140px"
                bg={"blue.900"}
                color={"white"}
                _hover={{
                  backgroundColor: "blue.700",
                  boxShadow: "m",
                }}
                variant="solid"
                mt="5"
                onClick={() => {
                  router.push(linkProps.link);
                }}
              >
                {linkProps.text}
              </Button>
            )}
          </Box>
        </Box>
      }
    </>
  );
};

export default PromotionBanner;
