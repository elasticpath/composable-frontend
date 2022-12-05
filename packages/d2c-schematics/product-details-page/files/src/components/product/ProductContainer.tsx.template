import ProductCarousel from "./carousel/ProductCarousel";
import { SimpleGrid, Stack } from "@chakra-ui/react";
import ProductSummary from "./ProductSummary";
import ProductDetails from "./ProductDetails";
import ProductExtensions from "./ProductExtensions";
import CartActions from "./CartActions";
import { IBase } from "../../lib/types/product-types";
import { ReactElement } from "react";

interface IProductContainer {
  productBase: IBase;
  children?: ReactElement;
}

export default function ProductContainer({
  productBase: { product, main_image, otherImages },
  children,
}: IProductContainer): JSX.Element {
  const { extensions } = product.attributes;
  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, md: 10 }}>
      {main_image && (
        <ProductCarousel images={otherImages} mainImage={main_image} />
      )}
      <Stack spacing={{ base: 6, md: 10 }}>
        <ProductSummary product={product} />
        {children}
        <ProductDetails product={product} />
        {extensions && <ProductExtensions extensions={extensions} />}
        <CartActions productId={product.id} />
      </Stack>
    </SimpleGrid>
  );
}
