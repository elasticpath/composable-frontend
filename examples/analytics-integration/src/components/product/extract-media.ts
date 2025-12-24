import { ElasticPathFile, ProductData } from "@epcc-sdk/sdks-shopper";

export interface ExtractedMedia {
  mainImage?: ElasticPathFile;
  allImages: ElasticPathFile[];
  otherImages: ElasticPathFile[];
  allFiles: ElasticPathFile[];
  otherFiles: ElasticPathFile[];
}

/**
 * Extracts the main product image and organizes all files/images into separate arrays.
 *
 * @param productData - The product data containing included files.
 * @returns An object with the main image, all images, other images, all files, and other files.
 */
export function extractProductMedia(productData: ProductData): ExtractedMedia {
  // Retrieve the main image id from the product's relationships if it exists
  const mainImageId = productData.data?.relationships?.main_image?.data?.id;

  // Combine the main_images and files arrays from the included object
  // If either is undefined, we default to an empty array.
  const mainImages = productData.included?.main_images ?? [];
  const otherFiles = productData.included?.files ?? [];
  const combinedFiles: ElasticPathFile[] = [...mainImages, ...otherFiles];

  let mainImage: ElasticPathFile | undefined;
  const allImages: ElasticPathFile[] = [];

  // Single pass over combined files
  for (const file of combinedFiles) {
    // Check if this file is the main image
    if (mainImageId && file.id === mainImageId) {
      mainImage = file;
    }
    // Check if file is an image by its mime type (adjust the condition as needed)
    if (file.mime_type && file.mime_type.startsWith("image/")) {
      allImages.push(file);
    }
  }

  // Exclude the main image from the arrays (if one was found)
  const otherImages = mainImage
    ? allImages.filter((file) => file.id !== mainImage.id)
    : allImages;
  const allFiles = combinedFiles;
  const otherFilesFiltered = mainImage
    ? combinedFiles.filter((file) => file.id !== mainImage.id)
    : combinedFiles;

  return {
    mainImage,
    allImages,
    otherImages,
    allFiles,
    otherFiles: otherFilesFiltered,
  };
}
