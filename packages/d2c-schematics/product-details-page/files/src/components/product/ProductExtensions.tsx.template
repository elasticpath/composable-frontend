import { Box, chakra, Stack, Text } from "@chakra-ui/react";
import { Fragment } from "react";
import { Extensions } from "@moltin/sdk";

interface IProductExtensions {
  extensions: Extensions;
}

const DescriptionList = chakra("dl");
const DescriptionTerm = chakra("dt", {
  baseStyle: { fontWeight: "600", textTransform: "capitalize" },
});
const DescriptionDetails = chakra("dd", {
  baseStyle: {
    mb: "2",
  },
});

const ProductExtensions = ({ extensions }: IProductExtensions): JSX.Element => {
  const extensionsValues = Object.values(extensions ?? {}).flat();

  return (
    <Stack spacing={{ base: 4, sm: 6 }} direction="column">
      <Box>
        <Text
          fontSize={{ base: "16px", lg: "18px" }}
          color="gray.800"
          fontWeight="500"
          textTransform="uppercase"
          mb="4"
        >
          More Info
        </Text>
        <DescriptionList>
          {extensionsValues.map((extension) => {
            const extensionKeys = Object.keys(extension);
            return extensionKeys.map((key) => {
              let value = extension[key];
              if (typeof value === "boolean") {
                value = value ? "Yes" : "No";
              }
              return (
                <Fragment key={`${key}-${value}`}>
                  <DescriptionTerm>{key}</DescriptionTerm>
                  <DescriptionDetails>{value}</DescriptionDetails>
                </Fragment>
              );
            });
          })}
        </DescriptionList>
      </Box>
    </Stack>
  );
};

export default ProductExtensions;
