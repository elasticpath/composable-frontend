import type { ProductResponse, File } from "@elasticpath/js-sdk";
import type { Dispatch, SetStateAction } from "react";

export type IdentifiableBaseProduct = ProductResponse & {
  id: string;
  attributes: { slug: string; sku: string; base_product: true };
};

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
