import type { File } from "@moltin/sdk";
import { CarouselProvider, Slider, Slide } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import {
  StyledButtonBack,
  StyledButtonNext,
  StyledImage,
} from "../../shared/carousel-wrapped";
import styles from "./ProductCarousel.module.css";
import { isMobile } from "react-device-detect";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

interface IVerticalCarousel {
  images: File[];
  visibleSlides: number;
  selectedProductImage: File;
  setSelectedProductImage: (file: File) => void;
}

const VerticalCarousel = ({
  images,
  visibleSlides,
  selectedProductImage,
  setSelectedProductImage,
}: IVerticalCarousel): JSX.Element => {
  const selectedStyle = styles["product-carousel-selected"];
  const baseStyle = styles["vertical-product-carousel-inner"];

  const controlsDisplay = images.length > visibleSlides ? "flex" : "none";

  return (
    <CarouselProvider
      visibleSlides={visibleSlides}
      totalSlides={images.length}
      step={1}
      orientation={"vertical"}
      naturalSlideWidth={80}
      naturalSlideHeight={100}
      infinite={images.length >= visibleSlides}
      dragEnabled={isMobile}
    >
      <StyledButtonBack
        paddingBottom={"1rem"}
        display={controlsDisplay}
        justifyContent="center"
        py=".5rem"
        w="full"
      >
        <ChevronUpIcon boxSize={5} />
      </StyledButtonBack>
      <Slider>
        {images.map((imageFile, index) => (
          <Slide
            key={imageFile.id}
            index={index}
            innerClassName={
              imageFile.id === selectedProductImage.id
                ? `${selectedStyle} ${baseStyle}`
                : baseStyle
            }
          >
            <StyledImage
              style={{ objectFit: "cover", borderRadius: "0.375rem" }}
              onClick={() => setSelectedProductImage(imageFile)}
              hasMasterSpinner={false}
              alt={imageFile.file_name}
              src={imageFile.link.href}
            />
          </Slide>
        ))}
      </Slider>
      <StyledButtonNext
        display={controlsDisplay}
        justifyContent="center"
        py=".5rem"
        w="full"
      >
        <ChevronDownIcon boxSize={5} />
      </StyledButtonNext>
    </CarouselProvider>
  );
};

export default VerticalCarousel;
