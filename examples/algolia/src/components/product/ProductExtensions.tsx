import { Box, chakra, Stack, Text } from "@chakra-ui/react";
import { Fragment } from "react";
import { Extensions } from "@moltin/sdk";
import {isSupportedExtension} from "../../lib/is-supported-extension";

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
              const value = extension[key];

              const EmptyEntry = <Fragment key={`${key}`}>Test</Fragment>

              if (!isSupportedExtension(value)) {
                console.warn(`Unsupported product extension unable to render "${key}" key`, value)
                return EmptyEntry
              }

              if (!value) {
                return EmptyEntry
              }

              return <Extension key={`${key}-${value}`} extKey={key} value={value} />
            });
          })}
        </DescriptionList>
      </Box>
    </Stack>
  );
};

function Extension({extKey, value}: {extKey: string, value: string | number | boolean}) {
  let decoratedValue = value;
  if (typeof value === "boolean") {
    decoratedValue = value ? "Yes" : "No";
  }

  return (
      <>
        <DescriptionTerm>{extKey}</DescriptionTerm>
        <DescriptionDetails>{decoratedValue}</DescriptionDetails>
      </>
  );
}

export default ProductExtensions;
