import type { File, ProductResponse, ShopperCatalogResource } from "@moltin/sdk"
import { describe, test, expect } from "vitest"
import {
  getProductMainImage,
  getProductOtherImageUrls,
  processImageFiles,
} from "./product-image-helpers"

describe("product image helper", () => {
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
      ]

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
      ]
      expect(processImageFiles(files as File[], "123")).toEqual(expected)
    })

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
      ]

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
      ]
      expect(processImageFiles(files as File[])).toEqual(expected)
    })

    test("getProductOtherImageUrls should return a products images files not including the main image", () => {
      const files: Partial<File>[] = [
        {
          type: "file",
          id: "0de087d5-253b-4f10-8a09-0c10ffd6e7fa",
          mime_type: "image/jpeg",
        },
        {
          type: "file",
          id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
          mime_type: "image/jpeg",
        },
      ]

      const mainImageFile: Partial<File> = {
        type: "file",
        id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
        mime_type: "image/jpeg",
      }

      const productResp: Partial<ShopperCatalogResource<ProductResponse>> = {
        included: {
          files: files as File[],
          main_images: [mainImageFile] as File[],
        },
      }

      const expected: Partial<File>[] = [
        {
          type: "file",
          id: "0de087d5-253b-4f10-8a09-0c10ffd6e7fa",
          mime_type: "image/jpeg",
        },
      ]
      expect(
        getProductOtherImageUrls(
          productResp.included?.files,
          mainImageFile as File,
        ),
      ).toEqual(expected)
    })

    test("getProductMainImage should return a products main image file", () => {
      const mainImageFile: Partial<File> = {
        type: "file",
        id: "123",
        mime_type: "image/jpeg",
      }

      const productResp: Partial<ShopperCatalogResource<ProductResponse>> = {
        included: {
          main_images: [mainImageFile] as File[],
        },
      }

      expect(getProductMainImage(productResp.included?.main_images)).toEqual(
        mainImageFile,
      )
    })

    test("getProductMainImage should return null when product does not have main image included", () => {
      const productResp: Partial<ShopperCatalogResource<ProductResponse>> = {
        included: {},
      }

      expect(getProductMainImage(productResp.included?.main_images)).toEqual(
        null,
      )
    })
  })
})
