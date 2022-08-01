import { Stack, SimpleGrid } from "@chakra-ui/react";
import { IBaseProductSku } from "../../lib/product-types";
import CartActions from "./CartActions";
import ProductCarousel from "./carousel/ProductCarousel";
import ProductDetails from "./ProductDetails";
import ProductSummary from "./ProductSummary";
import ProductVariations from "./ProductVariations";
import ProductExtensions from "./ProductExtensions";

interface IBaseProductDetail {
  baseSku: IBaseProductSku;
  handleAddToCart: () => void;
}

const BaseProductDetail = ({
  baseSku: {
    main_image,
    otherImages,
    product,
    variations,
    variationsMatrix,
    extensions,
  },
  handleAddToCart,
}: IBaseProductDetail): JSX.Element => {
  return (
    <SimpleGrid
      columns={{ base: 1, lg: 2 }}
      spacing={{ base: 8, md: 10 }}
      py={{ base: 18, md: 24 }}
    >
      {main_image && (
        <ProductCarousel mainImage={main_image} images={otherImages} />
      )}
      <Stack spacing={{ base: 6, md: 10 }}>
        <ProductSummary product={product} />
        <ProductDetails product={product} />
        <ProductExtensions extensions={extensions} />
        {variations && (
          <ProductVariations
            variations={variations}
            variationsMatrix={variationsMatrix}
            baseProductSlug={product.attributes.slug}
            currentSkuId={product.id}
          />
        )}
        <CartActions handleAddToCart={handleAddToCart} />
      </Stack>
    </SimpleGrid>
  );
};

export default BaseProductDetail;
