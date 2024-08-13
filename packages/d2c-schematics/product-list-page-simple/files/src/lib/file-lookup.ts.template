import { File, ProductResponse } from "@elasticpath/js-sdk";

export function getMainImageForProductResponse(
  productResponse: ProductResponse,
  mainImages: File[],
): File | undefined {
  const mainImageId = productResponse.relationships?.main_image?.data?.id;

  if (!mainImageId) {
    return;
  }

  return lookupFileUsingId(mainImageId, mainImages);
}

export function getOtherImagesForProductResponse(
  productResponse: ProductResponse,
  allFiles: File[],
): File[] | undefined {
  const productFilesIdObj = productResponse.relationships?.files?.data ?? [];

  if (productFilesIdObj?.length === 0) {
    return;
  }

  return productFilesIdObj.reduce((acc, fileIdObj) => {
    const file = lookupFileUsingId(fileIdObj.id, allFiles);
    return [...acc, ...(file ? [file] : [])];
  }, [] as File[]);
}

export function lookupFileUsingId(
  fileId: string,
  files: File[],
): File | undefined {
  return files.find((file) => {
    return file.id === fileId;
  });
}
