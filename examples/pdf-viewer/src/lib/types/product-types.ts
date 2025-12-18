import type { Dispatch, SetStateAction } from "react";
import type { ElasticPathFile, Product } from "@epcc-sdk/sdks-shopper";

export interface SkuChangingContextState {
  isChangingSku: boolean;
  setIsChangingSku: Dispatch<SetStateAction<boolean>>;
}

export interface SkuChangingModalContextState {
  isChangingSku: boolean;
  setIsChangingSku: Dispatch<SetStateAction<boolean>>;
  changedSkuId: string;
  setChangedSkuId: Dispatch<SetStateAction<string>>;
}

export interface OptionDict {
  [key: string]: string;
}

export interface ProductResponseWithImage extends Product {
  main_image?: ElasticPathFile;
}

export interface ProductImageObject {
  [key: string]: ElasticPathFile;
}
