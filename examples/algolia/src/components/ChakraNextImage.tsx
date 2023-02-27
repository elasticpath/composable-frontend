import { Box, BoxProps, chakra } from "@chakra-ui/react";
import NextImage, { ImageProps, ImageLoaderProps } from "next/future/image";
import { shimmer } from "./shimmer";
import { toBase64 } from "../lib/to-base-64";

const ChakraNextUnwrappedImage = chakra(NextImage, {
  shouldForwardProp: (prop) =>
    [
      "width",
      "height",
      "src",
      "alt",
      "quality",
      "placeholder",
      "blurDataURL",
      "loader ",
    ].includes(prop),
});

const myLoader = (resolverProps: ImageLoaderProps): string => {
  return `${resolverProps.src}?w=${resolverProps.width}&q=${resolverProps.quality}`;
};

export const ChakraNextImage = (props: ImageProps & BoxProps) => {
  const { src, alt, width, quality, height, ...rest } = props;
  return (
    <Box pos="relative" {...rest}>
      <ChakraNextUnwrappedImage
        w="auto"
        h="auto"
        loader={myLoader}
        width={width}
        quality={quality}
        height={height}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
        src={src}
        alt={alt}
        transition="all 0.2s"
        objectFit="cover"
      />
    </Box>
  );
};
