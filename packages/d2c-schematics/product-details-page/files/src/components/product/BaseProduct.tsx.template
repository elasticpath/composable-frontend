import { IBaseProduct } from "../../lib/types/product-types";
import ProductVariations from "./ProductVariations";
import ProductContainer from "./ProductContainer";

interface IBaseProductDetail {
  baseProduct: IBaseProduct;
}

const BaseProductDetail = ({
  baseProduct,
}: IBaseProductDetail): JSX.Element => {
  const {
    product: { attributes, id },
    variations,
    variationsMatrix,
  } = baseProduct;
  return (
    <ProductContainer productBase={baseProduct}>
      {variations && (
        <ProductVariations
          variations={variations}
          variationsMatrix={variationsMatrix}
          baseProductSlug={attributes.slug}
          currentSkuId={id}
        />
      )}
    </ProductContainer>
  );
};

export default BaseProductDetail;
