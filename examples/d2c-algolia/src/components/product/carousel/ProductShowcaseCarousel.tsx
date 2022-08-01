import { isMobile } from "react-device-detect";
import { Box, Button, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { CarouselProvider, Slider } from "pure-react-carousel";
import { StaticProduct } from "../../../lib/product-data";
import {
  StyledButtonBack,
  StyledButtonNext,
  StyledDot,
  StyledDotGroup,
  StyledImage,
  StyledSlide,
} from "../../shared/carousel-wrapped";
import styles from "./ProductCarousel.module.css";
import "pure-react-carousel/dist/react-carousel.es.css";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

interface IProductShowcaseCarousel {
  products: StaticProduct[];
}

const ProductShowcaseCarousel = ({
  products,
}: IProductShowcaseCarousel): JSX.Element => {
  const visibleSlides = 1;
  return (
    <>
      <CarouselProvider
        visibleSlides={visibleSlides}
        totalSlides={products.length}
        step={1}
        orientation={"horizontal"}
        naturalSlideWidth={60}
        naturalSlideHeight={40}
        infinite={products.length >= visibleSlides}
        dragEnabled={isMobile}
      >
        <Grid
          gridTemplateColumns={{ base: "1fr", lg: "auto 1fr auto" }}
          gap={12}
          alignItems={"center"}
          width={{ base: "full", lg: "80%" }}
          margin={"0 auto"}
          position={"relative"}
        >
          <StyledButtonBack
            display={{ base: "none", lg: "flex" }}
            justifyContent={"center"}
          >
            <ChevronLeftIcon boxSize={5} />
          </StyledButtonBack>
          <Box
            display={{ base: "flex", lg: "none" }}
            position={"absolute"}
            zIndex={1}
            alignItems="center"
            h="0"
            w={"full"}
            px={4}
          >
            <StyledButtonBack
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              backgroundColor={"white"}
              rounded={"full"}
              w={"2rem"}
              h={"2rem"}
            >
              <ChevronLeftIcon boxSize={5} />
            </StyledButtonBack>
            <StyledButtonNext
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              backgroundColor={"white"}
              rounded={"full"}
              w={"2rem"}
              h={"2rem"}
              marginLeft={"auto"}
            >
              <ChevronRightIcon boxSize={5} />
            </StyledButtonNext>
          </Box>
          <Slider>
            {products.map(({ imageSrc, title, subTitle }, index) => (
              <StyledSlide
                innerClassName={styles["showcase-product-carousel-inner"]}
                key={imageSrc}
                index={index}
                cursor="pointer"
              >
                <Grid
                  gridTemplateColumns={{ base: "1fr", lg: "1fr 2fr" }}
                  gap={"3.125rem"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <GridItem
                    flex="1 1 0"
                    display={{ base: "none", lg: "block" }}
                  >
                    <Text fontSize="lg" fontWeight="medium">
                      {title}
                    </Text>
                    <Text fontSize="md" mt="5">
                      {subTitle}
                    </Text>
                    <Button
                      bg={"blue.900"}
                      color={"white"}
                      _hover={{
                        backgroundColor: "blue.700",
                        boxShadow: "m",
                      }}
                      variant="solid"
                      mt="5"
                    >
                      Show Now
                    </Button>
                  </GridItem>
                  <StyledImage
                    objectFit="cover"
                    borderRadius="0.375rem"
                    maxHeight={{ base: "", lg: "31rem" }}
                    hasMasterSpinner={false}
                    alt={imageSrc}
                    src={imageSrc}
                  />
                </Grid>
              </StyledSlide>
            ))}
          </Slider>
          <StyledButtonNext
            display={{ base: "none", lg: "flex" }}
            justifyContent="center"
            w="full"
          >
            <ChevronRightIcon boxSize={5} />
          </StyledButtonNext>
        </Grid>
        <StyledDotGroup
          display={{ base: "block", lg: "none" }}
          py={6}
          renderDots={({ currentSlide }) => (
            <Flex gap={1} justifyContent="center">
              {products.map((product, index) => (
                <StyledDot
                  key={product.title}
                  slide={index}
                  w={2}
                  h={2}
                  backgroundColor={
                    currentSlide !== index ? "gray.400" : "gray.800"
                  }
                  borderRadius={"full"}
                />
              ))}
            </Flex>
          )}
        />
      </CarouselProvider>
    </>
  );
};

export default ProductShowcaseCarousel;
