import { useColorModeValue, Text } from "@chakra-ui/react";

interface IPrice {
  price: string;
  currency: string;
}

const Price = ({ price, currency }: IPrice): JSX.Element => {
  return (
    <Text
      color={useColorModeValue("gray.900", "gray.400")}
      fontWeight={300}
      marginTop={"15px"}
      fontSize={"xl"}
    >
      {price} {currency}
    </Text>
  );
};

export default Price;
