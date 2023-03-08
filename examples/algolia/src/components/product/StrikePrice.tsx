import { useColorModeValue, Text } from "@chakra-ui/react";
import { TextProps } from "@chakra-ui/layout";

interface IPrice extends TextProps {
  price: string;
  currency: string;
}

const StrikePrice = ({ price, currency, ...props }: IPrice): JSX.Element => {
  return (
    <Text
      color={useColorModeValue("red.500", "red.200")}
      fontWeight={300}
      marginTop="15px"
      fontSize="lg"
      textDecoration="line-through"
      ml={3}
      {...props}
    >
      {price} {currency}
    </Text>
  );
};

export default StrikePrice;
