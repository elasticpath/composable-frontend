import { ISimpleProduct } from "../../lib/types/product-types";
import ProductComponents from "./ProductComponents";
import ProductContainer from "./ProductContainer";

interface ISimpleProductDetail {
  simpleProduct: ISimpleProduct;
}

const SimpleProductDetail = ({
  simpleProduct,
}: ISimpleProductDetail): JSX.Element => {
  const { product, component_products } = simpleProduct;
  return (
    <ProductContainer productBase={simpleProduct}>
      {component_products && (
        <ProductComponents product={product} components={component_products} />
      )}
    </ProductContainer>
  );
};

export default SimpleProductDetail;
