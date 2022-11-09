import { useColorModeValue, Text } from "@chakra-ui/react";

interface IPriceProps {
  price: string;
  currency: string;
  size?: string;
}

const Price = ({ price, currency, size = "2xl" }: IPriceProps): JSX.Element => {
  return (
    <Text
      color={useColorModeValue("gray.900", "gray.400")}
      fontWeight={300}
      marginTop="15px"
      fontSize={size}
    >
      {price} {currency}
    </Text>
  );
};

export default Price;
