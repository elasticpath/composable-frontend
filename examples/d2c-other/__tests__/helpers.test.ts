import { ProductResponse, Variation } from "@moltin/sdk";
import {
  allVariationsHaveSelectedOption,
  getOptionsFromSkuId,
  getSkuIdFromOptions,
  isChildProductResource,
  isSimpleProductResource,
  mapOptionsToVariation,
} from "../src/services/helper";

describe("helpers", () => {
  describe("unit tests", () => {
    it("isChildProductResource should return false if it's a base product", () => {
      const sampleProduct = {
        attributes: {
          base_product: true,
        },
      } as ProductResponse;
      expect(isChildProductResource(sampleProduct)).toEqual(false);
    });

    it("isChildProductResource should return false if it is a simple product", () => {
      const sampleProduct = {
        attributes: {
          base_product: false,
        },
      } as ProductResponse;
      expect(isChildProductResource(sampleProduct)).toEqual(false);
    });
    it("isChildProductResource should return true if it is a child product", () => {
      const sampleProduct = {
        attributes: {
          base_product: false,
          base_product_id: "123",
        },
      } as ProductResponse;
      expect(isChildProductResource(sampleProduct)).toEqual(true);
    });

    it("isSimpleProductResource should return true if it is a simple product", () => {
      const sampleProduct = {
        attributes: {
          base_product: false,
        },
      } as ProductResponse;
      expect(isSimpleProductResource(sampleProduct)).toEqual(true);
    });

    it("isSimpleProductResource should return false if it is a base product", () => {
      const sampleProduct = {
        attributes: {
          base_product: true,
        },
      } as ProductResponse;
      expect(isSimpleProductResource(sampleProduct)).toEqual(false);
    });

    it("isSimpleProductResource should return false if it is a child product", () => {
      const sampleProduct = {
        attributes: {
          base_product: true,
          base_product_id: "123",
        },
      } as ProductResponse;
      expect(isSimpleProductResource(sampleProduct)).toEqual(false);
    });

    it("getSkuIDFromOptions should return the id of the sku for the provided options.", () => {
      const variationMatrixSample = {
        "4252d475-2d0e-4cd2-99d3-19fba34ef211": {
          "217883ce-55f1-4c34-8e00-e86c743f4dff": {
            "45e2612f-6bbf-4bc9-8803-80c5cf78ed89":
              "709e6cc6-a40c-4833-9469-b4abd0e7f67f",
            "8b6dfc96-11e6-455d-b042-e4137df3f13a":
              "c05839f5-3eac-48f2-9d36-1bc2a481a213",
          },
          "37b5bcf7-0b65-4e12-ad31-3052e27c107f": {
            "45e2612f-6bbf-4bc9-8803-80c5cf78ed89":
              "9e07495c-caf1-4f11-93c5-16cfeb63d492",
            "8b6dfc96-11e6-455d-b042-e4137df3f13a":
              "b9bb984a-7a6d-4433-a445-1cde0383bece",
          },
        },
        "693b16b8-a3b3-4419-ad03-61007a381c56": {
          "217883ce-55f1-4c34-8e00-e86c743f4dff": {
            "45e2612f-6bbf-4bc9-8803-80c5cf78ed89":
              "2d864c10-146f-4905-859f-86e63c18abf4",
            "8b6dfc96-11e6-455d-b042-e4137df3f13a":
              "42aef769-c97e-48a8-a3c4-2af8ad504ebb",
          },
        },
      };

      const options = [
        "693b16b8-a3b3-4419-ad03-61007a381c56",
        "45e2612f-6bbf-4bc9-8803-80c5cf78ed89",
        "217883ce-55f1-4c34-8e00-e86c743f4dff",
      ];

      expect(getSkuIdFromOptions(options, variationMatrixSample)).toEqual(
        "2d864c10-146f-4905-859f-86e63c18abf4"
      );
    });
    it("getSkuIDFromOptions should return undefined when proveded valid but not found options.", () => {
      const variationMatrixSample = {
        "4252d475-2d0e-4cd2-99d3-19fba34ef211": {
          "217883ce-55f1-4c34-8e00-e86c743f4dff": {
            "45e2612f-6bbf-4bc9-8803-80c5cf78ed89":
              "709e6cc6-a40c-4833-9469-b4abd0e7f67f",
            "8b6dfc96-11e6-455d-b042-e4137df3f13a":
              "c05839f5-3eac-48f2-9d36-1bc2a481a213",
          },
          "37b5bcf7-0b65-4e12-ad31-3052e27c107f": {
            "45e2612f-6bbf-4bc9-8803-80c5cf78ed89":
              "9e07495c-caf1-4f11-93c5-16cfeb63d492",
            "8b6dfc96-11e6-455d-b042-e4137df3f13a":
              "b9bb984a-7a6d-4433-a445-1cde0383bece",
          },
        },
        "693b16b8-a3b3-4419-ad03-61007a381c56": {
          "217883ce-55f1-4c34-8e00-e86c743f4dff": {
            "45e2612f-6bbf-4bc9-8803-80c5cf78ed89":
              "2d864c10-146f-4905-859f-86e63c18abf4",
            "8b6dfc96-11e6-455d-b042-e4137df3f13a":
              "42aef769-c97e-48a8-a3c4-2af8ad504ebb",
          },
        },
      };

      const options = ["4252d475-2d0e-4cd2-99d3-19fba34ef211", "456", "789"];

      expect(getSkuIdFromOptions(options, variationMatrixSample)).toEqual(
        undefined
      );
    });
    it("getSkuIDFromOptions should return undefined when proveded empty options.", () => {
      const variationMatrixSample = {};

      expect(getSkuIdFromOptions([], variationMatrixSample)).toEqual(undefined);
    });

    it("getOptionsFromSkuId should return a list of options for given sku id and matrix.", () => {
      const variationMatrixSample = {
        "option-1": {
          "option-3": {
            "option-5": "709e6cc6-a40c-4833-9469-b4abd0e7f67f",
            "option-6": "c05839f5-3eac-48f2-9d36-1bc2a481a213",
          },
          "option-4": {
            "option-5": "9e07495c-caf1-4f11-93c5-16cfeb63d492",
            "option-6": "b9bb984a-7a6d-4433-a445-1cde0383bece",
          },
        },
        "option-2": {
          "option-3": {
            "option-5": "2d864c10-146f-4905-859f-86e63c18abf4",
            "option-6": "42aef769-c97e-48a8-a3c4-2af8ad504ebb",
          },
        },
      };

      const expectedOutput = ["option-2", "option-3", "option-6"];

      expect(
        getOptionsFromSkuId(
          "42aef769-c97e-48a8-a3c4-2af8ad504ebb",
          variationMatrixSample
        )
      ).toEqual(expectedOutput);
    });

    it("mapOptionsToVariation should return the object mapping varitions to the selected option.", () => {
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

      const selectedOptions = ["option-2", "option-3"];

      const expectedOutput = {
        "variation-1": "option-2",
        "variation-2": "option-3",
      };

      expect(
        mapOptionsToVariation(selectedOptions, variations as Variation[])
      ).toEqual(expectedOutput);
    });

    it("allVariationsHaveSelectedOption should return true if all variations keys have a defined value for their key value pair.", () => {
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
        "variation-1": "option-2",
        "variation-2": "option-3",
      };

      expect(
        allVariationsHaveSelectedOption(optionDict, variations as Variation[])
      ).toEqual(true);
    });
  });
});
