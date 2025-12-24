import { createContext } from "react";
import {
  SkuChangingContextState,
  SkuChangingModalContextState,
} from "./types/product-types";

export const SkuChangingContext = createContext<SkuChangingContextState | null>(
  null,
);

export const SkuChangingModalContext =
  createContext<SkuChangingModalContextState | null>(null);
