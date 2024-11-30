"use client";
import Image from "next/image";
import { useProduct } from "@elasticpath/react-shopper-hooks";

const gray1pxBase64 =
  "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

export function ProductThumbnail({ productId }: { productId: string }) {
  const { data, included } = useProduct({ productId });

  const imageHref = included?.main_images?.[0]?.link.href;
  const title = data?.attributes?.name ?? "Loading...";
  return (
    <Image
      src={imageHref ?? gray1pxBase64}
      width="100"
      height="100"
      alt={title}
      className="overflow-hidden"
    />
  );
}
