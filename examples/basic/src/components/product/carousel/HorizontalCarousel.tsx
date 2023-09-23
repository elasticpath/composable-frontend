import {
  CarouselProvider,
  Slider,
  Slide,
  Image,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import styles from "./ProductCarousel.module.css";
import { isMobile } from "react-device-detect";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

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
  const controlsDisplaySettings = shouldDisplayControls ? "flex" : "hidden";

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
      <div
        className={`grid ${
          shouldDisplayControls
            ? "grid-cols-[auto_1fr_auto]"
            : "grid-cols-[1fr]"
        } items-center gap-4`}
      >
        <ButtonBack className={clsx(controlsDisplaySettings, "justify-center")}>
          <ChevronLeftIcon width={12} height={12} />
        </ButtonBack>
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
        <ButtonNext
          className={clsx(controlsDisplaySettings, "w-full justify-center")}
        >
          <ChevronRightIcon width={12} height={12} />
        </ButtonNext>
      </div>
    </CarouselProvider>
  );
};

export default HorizontalCarousel;
