import { Grid, GridItem } from "@chakra-ui/react";
import type { File } from "@moltin/sdk";
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
    completeImages[0]
  );

  return (
    <Grid gap={6}>
      <GridItem position="relative">
        <ProductHighlightCarousel
          images={completeImages}
          selectedProductImage={selectedProductImage}
          setSelectedProductImage={setSelectedProductImage}
        />
      </GridItem>
      <GridItem>
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
      </GridItem>
    </Grid>
  );
};

export default ProductCarousel;
