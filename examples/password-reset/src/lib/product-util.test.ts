import type {
  File,
  ProductResponse,
  ShopperCatalogResource,
  Variation,
} from "@elasticpath/js-sdk";
import { describe, test, expect } from "vitest";
import {
  createEmptyOptionDict,
  excludeChildProducts,
  filterBaseProducts,
  getProductMainImage,
  processImageFiles,
} from "./product-util";

describe("product util", () => {
  describe("unit tests", () => {
    test("processImageFiles should return only supported images without the main image", () => {
      const files: Partial<File>[] = [
        {
          type: "file",
          id: "123",
          mime_type: "image/jpeg",
        },
        {
          type: "file",
          id: "456",
          mime_type: "image/gif",
        },
        {
          type: "file",
          id: "789",
          mime_type: "image/jpeg",
        },
        {
          type: "file",
          id: "101112",
          mime_type: "image/png",
        },
        {
          type: "file",
          id: "131415",
          mime_type: "image/svg+xml",
        },
        {
          type: "file",
          id: "161718",
          mime_type: "image/webp",
        },
        {
          type: "file",
          id: "192021",
          mime_type: "video/mp4",
        },
        {
          type: "file",
          id: "222324",
          mime_type: "application/pdf",
        },
        {
          type: "file",
          id: "252627",
          mime_type: "application/vnd.ms-excel",
        },
        {
          type: "file",
          id: "282930",
          mime_type: "application/vnd.ms-powerpoint",
        },
        {
          type: "file",
          id: "313233",
          mime_type: "application/msword",
        },
      ];

      const expected: Partial<File>[] = [
        {
          type: "file",
          id: "456",
          mime_type: "image/gif",
        },
        {
          type: "file",
          id: "789",
          mime_type: "image/jpeg",
        },
        {
          type: "file",
          id: "101112",
          mime_type: "image/png",
        },
        {
          type: "file",
          id: "131415",
          mime_type: "image/svg+xml",
        },
        {
          type: "file",
          id: "161718",
          mime_type: "image/webp",
        },
      ];
      expect(processImageFiles(files as File[], "123")).toEqual(expected);
    });

    test("processImageFiles should support an undefined main image id", () => {
      const files: Partial<File>[] = [
        {
          type: "file",
          id: "123",
          mime_type: "image/jpeg",
        },
        {
          type: "file",
          id: "456",
          mime_type: "image/gif",
        },
      ];

      const expected: Partial<File>[] = [
        {
          type: "file",
          id: "123",
          mime_type: "image/jpeg",
        },
        {
          type: "file",
          id: "456",
          mime_type: "image/gif",
        },
      ];
      expect(processImageFiles(files as File[])).toEqual(expected);
    });

    test("getProductMainImage should return a products main image file", () => {
      const mainImageFile: Partial<File> = {
        type: "file",
        id: "123",
        mime_type: "image/jpeg",
      };

      const productResp: Partial<ShopperCatalogResource<ProductResponse>> = {
        included: {
          main_images: [mainImageFile] as File[],
        },
      };

      expect(getProductMainImage(productResp.included?.main_images)).toEqual(
        mainImageFile,
      );
    });

    test("getProductMainImage should return null when product does not have main image included", () => {
      const productResp: Partial<ShopperCatalogResource<ProductResponse>> = {
        included: {},
      };

      expect(getProductMainImage(productResp.included?.main_images)).toEqual(
        null,
      );
    });

    test("createEmptyOptionDict should return an OptionDict with all with variation keys assigned undefined values", () => {
      const variations: Partial<Variation>[] = [
        {
          id: "variation-1",
          name: "Generic Sizes",
          options: [
            {
              id: "option-1",
              description: "Small size",
              name: "SM",
              modifiers: [],
            },
            {
              id: "option-2",
              description: "Medium size",
              name: "MD",
              modifiers: [],
            },
          ],
        },
        {
          id: "variation-2",
          name: "Simple T-Shirt Sleeve Length",
          options: [
            {
              id: "option-3",
              description: "Simple T-Shirt with short sleeves",
              name: "Short",
              modifiers: [],
            },
            {
              id: "option-4",
              description: "Simple T-Shirt with long sleeves",
              name: "Long",
              modifiers: [],
            },
          ],
        },
      ];

      const optionDict = {
        "variation-1": undefined,
        "variation-2": undefined,
      };

      expect(createEmptyOptionDict(variations as Variation[])).toEqual(
        optionDict,
      );
    });

    test("filterBaseProducts should return only the base products from a list of ProductResponse", () => {
      const products: any = [
        {
          id: "123",
          attributes: {
            base_product: false,
            base_product_id: "789",
          },
          relationships: {
            parent: {
              data: {
                id: "parent-id",
                type: "product",
              },
            },
          },
        },
        {
          id: "456",
          attributes: {
            base_product: false,
          },
          relationships: {},
        },
        {
          id: "789",
          attributes: {
            base_product: true,
          },
          relationships: {},
        },
      ];

      const expected = [
        {
          id: "789",
          attributes: {
            base_product: true,
          },
          relationships: {},
        },
      ];
      const actual = filterBaseProducts(products as ProductResponse[]);
      expect(actual).toEqual(expected);
    });

    test("excludeChildProducts should return only the products that are not child products", () => {
      const products: any = [
        {
          id: "123",
          attributes: {
            base_product: false,
            base_product_id: "789",
          },
          relationships: {
            parent: {
              data: {
                id: "parent-id",
                type: "product",
              },
            },
          },
        },
        {
          id: "456",
          attributes: {
            base_product: false,
          },
          relationships: {},
        },
        {
          id: "789",
          attributes: {
            base_product: true,
          },
          relationships: {},
        },
      ];

      const expected = [
        {
          id: "456",
          attributes: {
            base_product: false,
          },
          relationships: {},
        },
        {
          id: "789",
          attributes: {
            base_product: true,
          },
          relationships: {},
        },
      ];

      expect(excludeChildProducts(products as ProductResponse[])).toEqual(
        expected,
      );
    });
  });
});
