import { Grid } from "@chakra-ui/react";
import { CarouselProvider, Slider, Slide, Image } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import {
  StyledButtonBack,
  StyledButtonNext,
} from "../../shared/carousel-wrapped";
import styles from "./ProductCarousel.module.css";
import { isMobile } from "react-device-detect";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

interface ICarouselImage {
  src: string;
  name: string | undefined;
}

interface IHorizontalCarousel {
  images: ICarouselImage[];
  visibleSlides: number;
  selectedImage: ICarouselImage;
  setSelectedImage: (image: ICarouselImage) => void;
}

const HorizontalCarousel = ({
  images,
  visibleSlides,
  selectedImage,
  setSelectedImage,
}: IHorizontalCarousel): JSX.Element => {
  const selectedStyle = styles["product-carousel-selected"];
  const baseStyle = styles["horizontal-product-carousel-inner"];

  const shouldDisplayControls = images.length > visibleSlides;
  const controlsDisplaySettings = shouldDisplayControls ? "flex" : "none";

  return (
    <CarouselProvider
      visibleSlides={visibleSlides}
      totalSlides={images.length}
      step={1}
      orientation="horizontal"
      naturalSlideWidth={45}
      naturalSlideHeight={40}
      infinite={images.length >= visibleSlides}
      dragEnabled={isMobile}
    >
      <Grid
        gridTemplateColumns={shouldDisplayControls ? "auto 1fr auto" : "1fr"}
        gap={4}
        alignItems="center"
      >
        <StyledButtonBack
          display={controlsDisplaySettings}
          justifyContent="center"
        >
          <ChevronLeftIcon boxSize={5} />
        </StyledButtonBack>
        <Slider>
          {images.map((image, index) => (
            <Slide
              key={image.src}
              index={index}
              innerClassName={
                image.src === selectedImage.src
                  ? `${selectedStyle} ${baseStyle}`
                  : baseStyle
              }
            >
              <Image
                style={{ objectFit: "cover", borderRadius: "0.375rem" }}
                onClick={() => setSelectedImage(image)}
                hasMasterSpinner={false}
                alt={image.name}
                src={image.src}
              />
            </Slide>
          ))}
        </Slider>
        <StyledButtonNext
          display={controlsDisplaySettings}
          justifyContent="center"
          w="full"
        >
          <ChevronRightIcon boxSize={5} />
        </StyledButtonNext>
      </Grid>
    </CarouselProvider>
  );
};

export default HorizontalCarousel;
