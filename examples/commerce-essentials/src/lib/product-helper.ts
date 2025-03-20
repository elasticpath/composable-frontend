import { CatalogsProductVariation, ElasticPath, FormattedPrice, ProductResponse, ShopperCatalogResource } from "@elasticpath/js-sdk";
import { OptionDict } from "./types/product-types";
import { MatrixObjectEntry, MatrixValue } from "./types/matrix-object-entry";
import { parseProductResponse, ShopperProduct } from "@elasticpath/react-shopper-hooks";
import { BaseProduct } from "@elasticpath/react-shopper-hooks";
import { ChildProduct } from "@elasticpath/react-shopper-hooks";

export const getSkuIdFromOptions = (
  options: string[],
  matrix: MatrixObjectEntry | MatrixValue,
): string | undefined => {
  if (typeof matrix === "string") {
    return matrix;
  }

  for (const currOption in options) {
    const nestedMatrix = matrix[options[currOption]];
    if (nestedMatrix) {
      return getSkuIdFromOptions(options, nestedMatrix);
    }
  }

  return undefined;
};

export const getOptionsFromSkuId = (
  skuId: string,
  entry: MatrixObjectEntry | MatrixValue,
  options: string[] = [],
): string[] | undefined => {
  if (typeof entry === "string") {
    return entry === skuId ? options : undefined;
  }

  let acc: string[] | undefined;
  Object.keys(entry).every((key) => {
    const result = getOptionsFromSkuId(skuId, entry[key], [...options, key]);
    if (result) {
      acc = result;
      return false;
    }
    return true;
  });
  return acc;
};

// TODO refactor
export const mapOptionsToVariation = (
  options: string[],
  variations: CatalogsProductVariation[],
): OptionDict => {
  return variations.reduce(
    (acc: OptionDict, variation: CatalogsProductVariation) => {
      const x = variation.options.find((varOption) =>
        options.some((selectedOption) => varOption.id === selectedOption),
      )?.id;
      return { ...acc, [variation.id]: x ? x : "" };
    },
    {},
  );
};

export function allVariationsHaveSelectedOption(
  optionsDict: OptionDict,
  variations: CatalogsProductVariation[],
): boolean {
  return !variations.some((variation) => !optionsDict[variation.id]);
}

export const isChildProductResource = (product: ProductResponse): boolean =>
  !product.attributes.base_product && !!product.attributes.base_product_id;

export const isSimpleProductResource = (product: ProductResponse): boolean =>
  !product.attributes.base_product && !product.attributes.base_product_id;

/**
 * promise will resolve after 300ms.
 */
export const wait300 = new Promise<void>((resolve) => {
  const wait = setTimeout(() => {
    clearTimeout(wait);
    resolve();
  }, 300);
});

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};  

export function getProductURLSegment(product: DeepPartial<ProductResponse>): string{
  let productSlugSegment ='';
  if (product?.attributes?.slug){
    productSlugSegment=`${product?.attributes?.slug}/`;
  }
  
  return `/products/${productSlugSegment}${product.id}`;
}
export interface VariationBaseProduct extends BaseProduct {
  childProducts: {id: string, slug:string}[];
}

export interface VariationChildProduct extends ChildProduct{
  siblingProducts: {id: string, slug:string}[];
}

export async function parseProductResponseVariationWrapper(product: ShopperCatalogResource<ProductResponse>, client: ElasticPath): Promise<ShopperProduct>{
  const shopperProduct = await parseProductResponse(product, client);
  if ((shopperProduct as BaseProduct).kind === "base-product") {
    const resultProduct = shopperProduct as VariationBaseProduct;
    const relationships=await client.ShopperCatalog.Products.GetProductChildren({productId:shopperProduct.response.id});
    resultProduct.childProducts=[];
    relationships.data.forEach((childProduct)=>{
      resultProduct.childProducts.push({id:childProduct.id, slug:childProduct.attributes.slug});
    });
    return resultProduct;
  }else if ((shopperProduct as ChildProduct).kind === "child-product") {
    const resultProduct = shopperProduct as VariationChildProduct;
    
    const relationships=await client.ShopperCatalog.Products.GetProductChildren({productId:product.data.attributes.base_product_id});
    resultProduct.siblingProducts=[];
    relationships.data.forEach((siblingProduct)=>{
      resultProduct.siblingProducts.push({id:siblingProduct.id, slug:siblingProduct.attributes.slug});
    });
    return resultProduct;
  }
  return shopperProduct;
}

export function getProductKeywords(product: ShopperCatalogResource<ProductResponse>): string | undefined {
  const extensions = product.data.attributes?.extensions;
  // iterate through extensions attributes to find if 'keywords' exists as a nested attribute within each key
  for (const key in extensions) {
    if (extensions[key].keywords) {
      return extensions[key].keywords as string;
    }
  }

  // once the SDK supports the tags attribute we can use that as a default
  return undefined;
}

// Inspects display_price for presence of either with_tax or without_tax and returns the appropriate price
// along with the corresponding original price if available. Assumes that mixing with_tax and without_tax is not allowed.
export function getProductDisplayPrices(product: ProductResponse): {
  displayPrice: FormattedPrice | undefined;
  originalPrice: FormattedPrice | undefined;
} {
  let displayPrice = undefined,
    originalPrice = undefined;
  if (product.meta.display_price?.without_tax) {
    displayPrice = product.meta.display_price.without_tax;
    originalPrice = product.meta.original_display_price?.without_tax;
  } else if (product.meta.display_price?.with_tax) {
    displayPrice = product.meta.display_price.with_tax;
    originalPrice = product.meta.original_display_price?.with_tax;
  }
  return { displayPrice, originalPrice };
}