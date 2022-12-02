import type {
  ProductResponse,
  CatalogsProductVariation,
  File,
} from "@moltin/sdk";
import type { Dispatch, SetStateAction } from "react";
import { MatrixObjectEntry } from "./matrix-object-entry";

export type IdentifiableBaseProduct = ProductResponse & {
  id: string;
  attributes: { slug: string; sku: string; base_product: true };
};

export interface IBase {
  product: ProductResponse;
  main_image: File | null;
  otherImages: File[];
  component_products?: ProductResponse[];
}

export interface IBaseProduct extends IBase {
  kind: "base-product";
  variations: CatalogsProductVariation[];
  variationsMatrix: MatrixObjectEntry;
}

export interface IChildProduct extends IBase {
  kind: "child-product";
  baseProduct: ProductResponse;
  variations: CatalogsProductVariation[];
  variationsMatrix: MatrixObjectEntry;
}

export interface ISimpleProduct extends IBase {
  kind: "simple-product";
}

export type IProduct = IBaseProduct | IChildProduct | ISimpleProduct;

export interface ProductContextState {
  isChangingSku: boolean;
  setIsChangingSku: Dispatch<SetStateAction<boolean>>;
}

export interface ProductModalContextState {
  isChangingSku: boolean;
  setIsChangingSku: Dispatch<SetStateAction<boolean>>;
  changedSkuId: string;
  setChangedSkuId: Dispatch<SetStateAction<string>>;
}

export interface OptionDict {
  [key: string]: string;
}

export interface ProductResponseWithImage extends ProductResponse {
  main_image?: File;
}

export interface ProductImageObject {
  [key: string]: File;
}
