import { useColorModeValue, Text } from "@chakra-ui/react";
import { TextProps } from "@chakra-ui/layout";

interface IPriceProps extends TextProps {
  price: string;
  currency: string;
  size?: string;
}

const Price = ({
  price,
  currency,
  size = "2xl",
  ...props
}: IPriceProps): JSX.Element => {
  return (
    <Text
      color={useColorModeValue("gray.900", "gray.400")}
      fontWeight={300}
      marginTop="15px"
      fontSize={size}
      {...props}
    >
      {price} {currency}
    </Text>
  );
};

export default Price;
