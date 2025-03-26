"use client";
import { type JSX, useMemo } from "react";
import { ElasticPathFile } from "@epcc-sdk/sdks-shopper";
import { ExtractedMedia } from "../extract-media";
import CarouselThumbnail from "../../carousel/CarouselThumbnail";

interface IProductCarousel {
  media: ExtractedMedia;
}

const ProductCarousel = ({
  media: { mainImage, otherImages: images },
}: IProductCarousel): JSX.Element => {
  const completeImages: ElasticPathFile[] = useMemo(
    () => [...(mainImage ? [mainImage] : []), ...images],
    [mainImage, images],
  );

  return (
    <div className="grid-cols-auto grid gap-6 w-full">
      <div className="relative">
        <CarouselThumbnail slides={completeImages} />;
      </div>
      <div className="relative"></div>
    </div>
  );
};

export default ProductCarousel;
