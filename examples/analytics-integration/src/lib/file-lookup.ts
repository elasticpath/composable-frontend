import { ElasticPathFile, Product } from "@epcc-sdk/sdks-shopper";

export function getMainImageForProductResponse(
  productResponse: Product,
  mainImages: ElasticPathFile[],
): ElasticPathFile | undefined {
  const mainImageId = productResponse.relationships?.main_image?.data?.id;

  if (!mainImageId) {
    return;
  }

  return lookupFileUsingId(mainImageId, mainImages);
}

export function getOtherImagesForProductResponse(
  productResponse: Product,
  allFiles: ElasticPathFile[],
): ElasticPathFile[] | undefined {
  const productFilesIdObj = productResponse.relationships?.files?.data ?? [];

  if (productFilesIdObj?.length === 0) {
    return;
  }

  return productFilesIdObj.reduce((acc, fileIdObj) => {
    const file = lookupFileUsingId(fileIdObj.id!, allFiles);
    return [...acc, ...(file ? [file] : [])];
  }, [] as ElasticPathFile[]);
}

export function lookupFileUsingId(
  fileId: string,
  files: ElasticPathFile[],
): ElasticPathFile | undefined {
  return files.find((file) => {
    return file.id === fileId;
  });
}
