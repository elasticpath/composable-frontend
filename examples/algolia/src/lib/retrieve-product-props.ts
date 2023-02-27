import { ProductResponse, Resource, ShopperCatalogResource } from "@moltin/sdk";
import { GetStaticPropsResult } from "next";
import {
  IBaseProduct,
  IChildProduct,
  ISimpleProduct,
} from "./types/product-types";
import { getProductMainImage, getProductOtherImageUrls } from "./product-util";
import { getProductById } from "../services/products";
import { sortAlphabetically } from "./sort-alphabetically";

export function retrieveSimpleProps(
  productResource: ShopperCatalogResource<ProductResponse>
): GetStaticPropsResult<ISimpleProduct> {
  const component_products = productResource.included?.component_products;
  return {
    props: {
      kind: "simple-product",
      product: productResource.data,
      main_image: getProductMainImage(productResource),
      otherImages: getProductOtherImageUrls(productResource),
      ...(component_products && { component_products }),
    },
  };
}

export async function retrieveChildProps(
  childProductResource: Resource<ProductResponse>
): Promise<GetStaticPropsResult<IChildProduct>> {
  const baseProductId = childProductResource.data.attributes.base_product_id;
  const baseProduct = await getProductById(baseProductId);
  if (!baseProduct) {
    throw Error(
      `Unable to retrieve child props, failed to get the base product for ${baseProductId}`
    );
  }
  const {
    data: {
      meta: { variation_matrix, variations },
    },
  } = baseProduct;

  if (!variations || !variation_matrix) {
    throw Error(
      `Unable to retrieve child props, failed to get the variations or variation_matrix from base product for ${baseProductId}`
    );
  }

  return {
    props: {
      kind: "child-product",
      product: childProductResource.data,
      baseProduct: baseProduct.data,
      main_image: getProductMainImage(childProductResource),
      otherImages: getProductOtherImageUrls(childProductResource),
      variationsMatrix: variation_matrix,
      variations: variations.sort(sortAlphabetically),
    },
  };
}

export async function retrieveBaseProps(
  baseProductResource: Resource<ProductResponse>
): Promise<GetStaticPropsResult<IBaseProduct>> {
  const {
    data: {
      meta: { variations, variation_matrix },
      attributes: { slug },
    },
  } = baseProductResource;

  if (!variations || !variation_matrix) {
    throw Error(
      `Unable to retrieve base product props, failed to get the variations or variation_matrix from base product for ${slug}`
    );
  }

  return {
    props: {
      kind: "base-product",
      product: baseProductResource.data,
      main_image: getProductMainImage(baseProductResource),
      otherImages: getProductOtherImageUrls(baseProductResource),
      variationsMatrix: variation_matrix,
      variations: variations.sort(sortAlphabetically),
    },
  };
}
