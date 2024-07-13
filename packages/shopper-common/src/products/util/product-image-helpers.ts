import type { File } from "@moltin/sdk"

export function processImageFiles(files: File[], mainImageId?: string) {
  // filters out main image and keeps server order
  const supportedMimeTypes = [
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ]

  if (!mainImageId) {
    return files
  }

  return files.filter(
    (fileEntry) =>
      fileEntry.id !== mainImageId &&
      supportedMimeTypes.some((type) => fileEntry.mime_type === type),
  )
}

export function getProductOtherImageUrls(
  files: File[] | undefined,
  mainImageFile: File | undefined,
): File[] {
  return files ? processImageFiles(files, mainImageFile?.id) : []
}

export function getProductMainImage(
  mainImages: File[] | undefined,
): File | null {
  return mainImages?.[0] || null
}
