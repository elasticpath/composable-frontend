"use client";
import Image from "next/image";

const gray1pxBase64 =
  "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

export function ProductThumbnail({
  imageHref,
  name,
  priority,
}: {
  imageHref?: string;
  name?: string;
  priority?: boolean;
}) {
  const title = name ?? "Loading...";

  let resolvedImageHref = gray1pxBase64;
  if (imageHref && imageHref !== "") {
    resolvedImageHref = imageHref;
  }
  return (
    <Image
      priority={priority}
      src={resolvedImageHref}
      width="100"
      height="100"
      alt={title}
      className="overflow-hidden"
    />
  );
}
