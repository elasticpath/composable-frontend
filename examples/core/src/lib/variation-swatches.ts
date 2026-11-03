import type { ElasticPathFile, ProductListData } from "@epcc-sdk/sdks-shopper";
import type { FamilyVariation, VariationMatrix } from "./product-family";
import { getSkuIdFromOptions } from "./product-helper";

export const SWATCH_COLOR_ATTRIBUTE = "color";

export type SwatchSource = {
  color?: string;
  image?: { id: string; url: string };
};

export type OptionSwatch =
  | { kind: "color"; color: string }
  | { kind: "image"; url: string }
  | { kind: "text" };

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const TEXT_SWATCH: OptionSwatch = { kind: "text" };

export function parseSwatchColor(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return HEX_COLOR.test(trimmed) ? trimmed.toLowerCase() : undefined;
}

export function resolveVariationSwatches({
  variations,
  matrix,
  sources,
  selectedOptionIds,
}: {
  variations: FamilyVariation[];
  matrix?: VariationMatrix;
  sources: Record<string, SwatchSource>;
  selectedOptionIds: Array<string | undefined>;
}): OptionSwatch[][] {
  return variations.map((variation, variationIndex) => {
    const childSources = variation.options.map((option) => {
      const childId = matrix
        ? getSkuIdFromOptions(
            selectionChoosing(variations, selectedOptionIds, variationIndex, option.id),
            matrix,
          )
        : undefined;
      return childId ? sources[childId] : undefined;
    });

    const colors = childSources.map((child) => parseSwatchColor(child?.color));
    const images = childSources.map((child) => child?.image);
    const colorsVaryAlongVariation = hasTwoDistinct(colors);
    const imagesVaryAlongVariation = hasTwoDistinct(images.map((image) => image?.id));

    return childSources.map((_, optionIndex): OptionSwatch => {
      const color = colors[optionIndex];
      const image = images[optionIndex];

      if (colorsVaryAlongVariation && color) {
        return { kind: "color", color };
      }
      if (imagesVaryAlongVariation && image) {
        return { kind: "image", url: image.url };
      }
      return TEXT_SWATCH;
    });
  });
}

function selectionChoosing(
  variations: FamilyVariation[],
  selectedOptionIds: Array<string | undefined>,
  variationIndex: number,
  optionId: string,
): string[] {
  return variations
    .map((other, index) =>
      index === variationIndex
        ? optionId
        : (selectedOptionIds[index] ?? other.options[0]?.id),
    )
    .filter((id): id is string => typeof id === "string");
}

function hasTwoDistinct(values: Array<string | undefined>): boolean {
  return new Set(values.filter((value) => value !== undefined)).size > 1;
}

export function swatchSourcesFromChildProducts(
  children: ProductListData | undefined,
): Record<string, SwatchSource> {
  const files = children?.included?.main_images ?? [];

  return Object.fromEntries(
    (children?.data ?? [])
      .filter((child) => typeof child.id === "string")
      .map((child) => [
        child.id!,
        {
          color: child.attributes?.shopper_attributes?.[SWATCH_COLOR_ATTRIBUTE],
          image: findImage(files, child.relationships?.main_image?.data?.id),
        },
      ]),
  );
}

export function swatchSourcesFromVariants(
  variants: Record<string, { mainImageId?: string; color?: string }>,
  files: ElasticPathFile[],
): Record<string, SwatchSource> {
  return Object.fromEntries(
    Object.entries(variants).map(([id, variant]) => [
      id,
      { color: variant.color, image: findImage(files, variant.mainImageId) },
    ]),
  );
}

function findImage(
  files: ElasticPathFile[],
  imageId: string | undefined,
): SwatchSource["image"] {
  if (!imageId) {
    return undefined;
  }

  const url = files.find((file) => file.id === imageId)?.link?.href;
  return url ? { id: imageId, url } : undefined;
}
