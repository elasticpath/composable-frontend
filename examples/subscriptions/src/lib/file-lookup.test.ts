import { describe, test, expect } from "vitest";
import { ProductResponse, File } from "@elasticpath/js-sdk";
import {
  getMainImageForProductResponse,
  getOtherImagesForProductResponse,
} from "./file-lookup";

describe("file-lookup", () => {
  test("getImagesForProductResponse should return the correct image file object", () => {
    const productResp = {
      id: "944cef1a-c906-4efc-b920-d2c489ec6181",
      relationships: {
        files: {
          data: [
            {
              created_at: "2022-05-27T08:16:58.110Z",
              id: "0de087d5-253b-4f10-8a09-0c10ffd6e7fa",
              type: "file",
            },
            {
              created_at: "2022-05-27T08:16:58.110Z",
              id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
              type: "file",
            },
            {
              created_at: "2023-10-28T14:19:20.832Z",
              id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
              type: "file",
            },
          ],
        },
        main_image: {
          data: {
            id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
            type: "main_image",
          },
        },
        parent: {
          data: {
            id: "2f435914-03b5-4b9e-80cb-08d3baa4c1d3",
            type: "product",
          },
        },
      },
    } as Partial<ProductResponse>;

    const mainImage: Partial<File>[] = [
      {
        type: "file",
        id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/1fa7be8b-bdcf-43a0-8748-33e549d2c03e.jpeg",
        },
      },
      {
        type: "file",
        id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/e5b9fed7-fcef-44d7-9ab1-3b4a277baf21.jpg",
        },
      },
      {
        type: "file",
        id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/1fa7be8b-bdcf-43a0-8748-33e549d2c03e.jpeg",
        },
      },
      {
        type: "file",
        id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/1fa7be8b-bdcf-43a0-8748-33e549d2c03e.jpeg",
        },
      },
    ];

    expect(
      getMainImageForProductResponse(
        productResp as ProductResponse,
        mainImage as File[],
      ),
    ).toEqual({
      type: "file",
      id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
      link: {
        href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/e5b9fed7-fcef-44d7-9ab1-3b4a277baf21.jpg",
      },
    });
  });

  test("getOtherImagesForProductResponse should return other images for product", () => {
    const productResp = {
      id: "944cef1a-c906-4efc-b920-d2c489ec6181",
      relationships: {
        files: {
          data: [
            {
              created_at: "2022-05-27T08:16:58.110Z",
              id: "0de087d5-253b-4f10-8a09-0c10ffd6e7fa",
              type: "file",
            },
            {
              created_at: "2022-05-27T08:16:58.110Z",
              id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
              type: "file",
            },
            {
              created_at: "2023-10-28T14:19:20.832Z",
              id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
              type: "file",
            },
          ],
        },
        main_image: {
          data: {
            id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
            type: "main_image",
          },
        },
        parent: {
          data: {
            id: "2f435914-03b5-4b9e-80cb-08d3baa4c1d3",
            type: "product",
          },
        },
      },
    } as Partial<ProductResponse>;

    const files = [
      {
        type: "file",
        id: "0de087d5-253b-4f10-8a09-0c10ffd6e7fa",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/0de087d5-253b-4f10-8a09-0c10ffd6e7fa.jpeg",
        },
      },
      {
        type: "file",
        id: "0de087d5-253b-4f10-8a09-0c10ffd6e7fa",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/0de087d5-253b-4f10-8a09-0c10ffd6e7fa.jpeg",
        },
      },
      {
        type: "file",
        id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/1fa7be8b-bdcf-43a0-8748-33e549d2c03e.jpeg",
        },
      },
      {
        type: "file",
        id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/e5b9fed7-fcef-44d7-9ab1-3b4a277baf21.jpg",
        },
      },
      {
        type: "file",
        id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/1fa7be8b-bdcf-43a0-8748-33e549d2c03e.jpeg",
        },
      },
      {
        type: "file",
        id: "d402c7e2-c8e9-46bc-93f4-30955cd0b9ec",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/d402c7e2-c8e9-46bc-93f4-30955cd0b9ec.jpg",
        },
      },
    ] as Partial<File>[];

    expect(
      getOtherImagesForProductResponse(
        productResp as ProductResponse,
        files as File[],
      ),
    ).toEqual([
      {
        type: "file",
        id: "0de087d5-253b-4f10-8a09-0c10ffd6e7fa",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/0de087d5-253b-4f10-8a09-0c10ffd6e7fa.jpeg",
        },
      },
      {
        type: "file",
        id: "1fa7be8b-bdcf-43a0-8748-33e549d2c03e",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/1fa7be8b-bdcf-43a0-8748-33e549d2c03e.jpeg",
        },
      },
      {
        type: "file",
        id: "e5b9fed7-fcef-44d7-9ab1-3b4a277baf21",
        link: {
          href: "https://files-eu.epusercontent.com/856eeae6-45ea-453f-ab75-e53e84bf3c61/e5b9fed7-fcef-44d7-9ab1-3b4a277baf21.jpg",
        },
      },
    ]);
  });
});
