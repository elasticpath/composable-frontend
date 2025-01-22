import type { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import type { Offer, Product, ProductGroup, WithContext, Thing } from "schema-dts";
interface IProductSchema {
  product: ShopperProduct;
}

const ProductSchema = ({ product }: IProductSchema): JSX.Element => {
  const {
    response,
  } = product;

  let schema = {};

  if (product.kind === "child-product") {
    const baseResponse = product.baseProduct.response;
    const productGroupSchema: ProductGroup = {
      "@type": "ProductGroup",
      "@id": baseResponse.attributes.slug,
      productGroupID: baseResponse.attributes.sku,
      name: baseResponse.attributes.name,
      description: baseResponse.attributes.description,
      sku: baseResponse.attributes.sku,
      image: product.baseProduct.main_image?.link.href,
      // @ts-ignore - support for custom options
      variesBy: baseResponse.meta?.variations?.map(
        (variation) => variation.name,
      ),
    };
    
    const offers: Offer[] = buildOffers(product);
    const productSchema: Product = buildProduct(product, offers)
    productSchema.isVariantOf = {
      "@id": baseResponse.attributes.slug,
    };
    // @ts-ignore - support for custom options
    productSchema.options = [];
    // @ts-ignore - child_variations is supported but missing from the sdk type.
    response.meta.child_variations.forEach((variation) => {
      if (variation.name.toLowerCase() === "color") {
        productSchema.color = variation.option.name;
     
      } else if (variation.name.toLowerCase() === "size") {
        productSchema.size = variation.option.name;
      } else {
        // @ts-ignore - support for custom options
        productSchema.options.push({
          "@type": "PropertyValue",
          name: variation.name,
          value: variation.option.name,
        });
      }
    })

    productGroupSchema.hasVariant = [productSchema];
    schema = addContext(productGroupSchema);
  } else if (product.kind === "simple-product") {

    const offers: Offer[] = buildOffers(product);
    const productSchema: Product = buildProduct(product, offers)

    schema = addContext(productSchema);
  }

  return (
    <script id="product-schema" type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: schema,
      }} />
  );
};

export default ProductSchema;

function addContext(productSchema: Product) {
  return JsonLd<Product>({
    "@context": "https://schema.org",
    ...productSchema,
  });
}

export function JsonLd<T extends Thing>(json: WithContext<T>): string {
  return JSON.stringify(json);
}

function buildProduct(product: ShopperProduct, offers: Offer[]): Product {
  const response = product.response;
  return {
    "@type": "Product",
    name: response.attributes.name,
    description: response.attributes.description,
    sku: response.attributes.sku,
    mpn: response.attributes.manufacturer_part_num,
    image: product.main_image?.link.href,
    offers,
  };
}

function buildOffers(product: ShopperProduct): Offer[] {
  if (!product.response.attributes.price) {
    return [];
  }
  return Object.keys(product.response.attributes.price).map(key => {
    return {
      "@type": "Offer",
      price: product.response.attributes.price[key].amount,
      priceCurrency: key,
    };
  });
}

