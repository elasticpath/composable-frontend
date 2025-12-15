import { ProductData, ProductListData } from "@epcc-sdk/sdks-shopper";
import { JSX } from "react";
import type {
  Offer,
  Product,
  ProductGroup,
  Thing,
  WithContext,
} from "schema-dts";
interface IProductSchema {
  product: ProductData;
  parentProduct?: ProductData;
  variationProducts?: ProductListData;
}

const ProductSchema = ({ product, parentProduct, variationProducts }: IProductSchema): JSX.Element => {
  let schema;
  const productType = product?.data?.meta?.product_types?.[0];

  if (productType === "child" || productType === "parent") {
    const parentProd = productType === "child" ? parentProduct : product;
    const productGroupSchema: ProductGroup = buildProductGroup(parentProd);

    if (variationProducts?.data?.length) {
      const variants: Product[] = variationProducts.data.map((child) => {
        const offers: Offer[] = buildOffers({data: child});
        const childSchema: Product = buildProduct({data: child, included: variationProducts?.included}, offers);
        childSchema.isVariantOf = { "@id": parentProd?.data?.attributes?.slug || parentProd?.data?.id || '' };
        addOptions(childSchema, {data: child}, parentProd);
        return childSchema;
      });
      productGroupSchema.hasVariant = variants;
    }

    schema = addContext(productGroupSchema);

  } else {
    const offers: Offer[] = buildOffers(product);
    const productSchema: Product = buildProduct(product, offers);

    schema = addContext(productSchema);
  }
  
  if (!schema) {
    return <></>;
  }
  
  return (
    <script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: schema,
      }}
    />
  );
};

export default ProductSchema;


function addOptions(productSchema: Product, child: ProductData, parent?: ProductData) {
  // @ts-expect-error - support for custom options
  productSchema.options = [];

  const childId = child?.data?.id;
  const variations = parent?.data?.meta?.variations || [];

  variations.forEach((variation) => {
    const option = variation?.options?.find((opt) => {
      if (!opt.id) return false;
      return parent?.data?.meta?.variation_matrix?.[opt.id] === childId;
    });

    if (!option) return;

    if (variation?.name?.toLowerCase() === "size") {
      productSchema.size = option.name;
    } else if (variation?.name?.toLowerCase() === "color") {
      productSchema.color = option.name;
    } else {
      // @ts-expect-error - support for custom options
      productSchema.options.push({
        "@type": "PropertyValue",
        name: variation.name,
        value: option.name,
      });
    }
  });
}

function buildProductGroup(parentProduct?: ProductData): ProductGroup {
  const parentProductData = parentProduct?.data;

  let mainImageUrl: string | undefined;
  const mainImageId = parentProductData?.relationships?.main_image?.data?.id;
  if (mainImageId && parentProduct?.included?.main_images) {
    const mainImage = parentProduct.included.main_images.find((img) => img.id === mainImageId);
    if (mainImage) {
      mainImageUrl = mainImage.link?.href;
    }
  }

  return {
    "@type": "ProductGroup",
    "@id": parentProductData?.attributes?.slug,
    productGroupID: parentProductData?.attributes?.sku,
    name: parentProductData?.attributes?.name,
    description: parentProductData?.attributes?.description,
    sku: parentProductData?.attributes?.sku,
    image: mainImageUrl,
    // @ts-expect-error - support for custom options
    variesBy: parentProductData?.meta?.variations?.map((variation) => variation.name),
  };
}

function addContext(productSchema: Product) {
  return JsonLd<Product>({
    "@context": "https://schema.org",
    ...productSchema,
  });
}

export function JsonLd<T extends Thing>(json: WithContext<T>): string {
  return JSON.stringify(json);
}

function buildProduct(product: ProductData, offers: Offer[]): Product {
  const productData = product.data;

  let mainImageUrl: string | undefined;
  const mainImageId = productData?.relationships?.main_image?.data?.id;
  if (mainImageId && product?.included?.main_images) {
    const mainImage = product.included.main_images.find((img) => img.id === mainImageId);
    if (mainImage) {
      mainImageUrl = mainImage.link?.href;
    }
  }
  
  return {
    "@type": "Product",
    name: productData?.attributes?.name,
    description: productData?.attributes?.description,
    sku: productData?.attributes?.sku,
    mpn: productData?.attributes?.manufacturer_part_num,
    image: mainImageUrl,
    offers,
  };
}

function buildOffers(product: ProductData): Offer[] {
  if (!product?.data?.attributes?.price) {
    return [];
  }
  return Object.keys(product.data.attributes.price).map((key) => {
    const amount = product?.data?.attributes?.price?.[key]?.amount;
    return {
      "@type": "Offer",
      price: amount !== undefined ? Number(amount) : undefined,
      priceCurrency: key,
    };
  });
}
