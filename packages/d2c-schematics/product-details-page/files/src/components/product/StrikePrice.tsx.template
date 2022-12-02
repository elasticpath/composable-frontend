import { useColorModeValue, Text } from "@chakra-ui/react";

interface IPrice {
  price: string;
  currency: string;
}

const StrikePrice = ({ price, currency }: IPrice): JSX.Element => {
  return (
    <Text
      color={useColorModeValue("red.500", "red.200")}
      fontWeight={300}
      marginTop="15px"
      fontSize="lg"
      textDecoration="line-through"
      ml={3}
    >
      {price} {currency}
    </Text>
  );
};

export default StrikePrice;
