import { Stack, SimpleGrid } from "@chakra-ui/react";
import type { IChildSku } from "../../lib/product-types";
import CartActions from "./CartActions";
import ProductCarousel from "./carousel/ProductCarousel";
import ProductDetails from "./ProductDetails";
import ProductSummary from "./ProductSummary";
import ProductVariations from "./ProductVariations";
import ProductExtensions from "./ProductExtensions";

interface IChildProductDetail {
  childSku: IChildSku;
  handleAddToCart: () => void;
}

const ChildProductDetail = ({
  childSku: {
    product,
    main_image,
    otherImages,
    baseProduct,
    variations,
    variationsMatrix,
    extensions,
  },
  handleAddToCart,
}: IChildProductDetail): JSX.Element => {
  return (
    <SimpleGrid
      columns={{ base: 1, lg: 2 }}
      spacing={{ base: 8, md: 10 }}
      py={{ base: 18, md: 24 }}
    >
      {main_image && (
        <ProductCarousel images={otherImages} mainImage={main_image} />
      )}
      <Stack spacing={{ base: 6, md: 10 }}>
        <ProductSummary product={product} />
        <ProductDetails product={product} />
        <ProductExtensions extensions={extensions} />
        {variations && (
          <ProductVariations
            variations={variations}
            variationsMatrix={variationsMatrix}
            baseProductSlug={baseProduct.attributes.slug}
            currentSkuId={product.id}
          />
        )}
        <CartActions handleAddToCart={handleAddToCart} />
      </Stack>
    </SimpleGrid>
  );
};

export default ChildProductDetail;
