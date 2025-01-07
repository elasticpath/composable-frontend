import type { File } from "@elasticpath/js-sdk";
import "pure-react-carousel/dist/react-carousel.es.css";
import { useState } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import ProductHighlightCarousel from "./ProductHighlightCarousel";

interface IProductCarousel {
  images: File[];
  mainImage: File | undefined;
}

const ProductCarousel = ({
  images,
  mainImage,
}: IProductCarousel): JSX.Element => {
  const completeImages: File[] = [...(mainImage ? [mainImage] : []), ...images];

  const [selectedProductImage, setSelectedProductImage] = useState(
    completeImages[0],
  );

  return (
    <div className="grid-cols-auto grid gap-6 w-full">
      <div className="relative">
        <ProductHighlightCarousel
          images={completeImages}
          selectedProductImage={selectedProductImage}
          setSelectedProductImage={setSelectedProductImage}
        />
      </div>
      <div className="relative">
        <HorizontalCarousel
          images={completeImages.map((item) => ({
            src: item.link.href,
            name: item.file_name,
          }))}
          visibleSlides={5}
          selectedImage={{
            src: selectedProductImage.link.href,
            name: selectedProductImage.file_name,
          }}
          setSelectedImage={({ src }) => {
            const found = completeImages.find((item) => item.link.href === src);
            setSelectedProductImage(found!);
          }}
        />
      </div>
    </div>
  );
};

export default ProductCarousel;
