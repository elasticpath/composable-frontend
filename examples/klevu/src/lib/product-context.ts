import { createContext } from "react";
import {
  ProductContextState,
  ProductModalContextState,
} from "./types/product-types";

export const ProductContext = createContext<ProductContextState | null>(null);

export const ProductModalContext =
  createContext<ProductModalContextState | null>(null);
