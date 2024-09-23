import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import styles from "./ProductCarousel.module.css";
import { isMobile } from "react-device-detect";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import Image from "next/image";

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
  const horizontalStyle = styles["horizontal-product-carousel-inner"];

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
              innerClassName={clsx(
                horizontalStyle,
                image.src === selectedImage.src &&
                  "border-2 border-brand-primary",
                "rounded-lg cursor-pointer w-[calc(100%-10px)]",
              )}
            >
              <Image
                style={{ objectFit: "contain" }}
                className="bg-[#f6f7f9] rounded-lg"
                onClick={() => setSelectedImage(image)}
                alt={image.name ?? `Product image ${index + 1}`}
                src={image.src}
                fill
                sizes="(min-width: 110px) 66vw, 100vw"
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
