import { useCallback } from "react";
import { isMobile } from "react-device-detect";
import type { File } from "@moltin/sdk";
import { CarouselProvider, Slide, Slider } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { CarouselListener } from "./CarouselListener";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface IProductHighlightCarousel {
  images: File[];
  selectedProductImage: File;
  setSelectedProductImage: (file: File) => void;
}

const ProductHighlightCarousel = ({
  images,
  selectedProductImage,
  setSelectedProductImage,
}: IProductHighlightCarousel): JSX.Element => {
  const selectedImageIndex = images.findIndex(
    (img) => img.id === selectedProductImage.id,
  );

  const selectPrevImage = (currentIndex: number) =>
    setSelectedProductImage(images[currentIndex - 1]);

  const selectNextImage = (currentIndex: number) =>
    setSelectedProductImage(images[currentIndex + 1]);

  const selectImageWithListener = useCallback(
    (currentIndex: number) => setSelectedProductImage(images[currentIndex]),
    [images, setSelectedProductImage],
  );

  return (
    <CarouselProvider
      visibleSlides={1}
      totalSlides={images.length}
      currentSlide={selectedImageIndex}
      naturalSlideWidth={400}
      naturalSlideHeight={400}
      dragEnabled={isMobile}
    >
      <CarouselListener setCurrentSlide={selectImageWithListener} />

      <div className="absolute top-1/2 z-10 flex h-0 w-full -translate-y-1/2 items-center justify-between px-4 md:hidden">
        <div>
          <ChevronLeftIcon
            className={`${
              selectedImageIndex < 1 ? "hidden" : "flex"
            } flex cursor-pointer items-center justify-center rounded-full bg-slate-200 p-1`}
            width={30}
            height={30}
            onClick={() => selectPrevImage(selectedImageIndex)}
          />
        </div>
        <div>
          <ChevronRightIcon
            className={`${
              selectedImageIndex + 1 === images.length ? "hidden" : "flex"
            } flex cursor-pointer items-center justify-center rounded-full bg-slate-200 p-1`}
            width={30}
            height={30}
            onClick={() => selectNextImage(selectedImageIndex)}
          />
        </div>
      </div>
      <Slider className="rounded-lg">
        {images.map((imageFile, index) => (
          <Slide key={imageFile.id} index={index}>
            <Image
              className="object-cover object-center"
              src={imageFile.link.href}
              alt={imageFile.file_name || imageFile.link.href}
              width={800}
              height={800}
            />
          </Slide>
        ))}
      </Slider>
    </CarouselProvider>
  );
};

export default ProductHighlightCarousel;
