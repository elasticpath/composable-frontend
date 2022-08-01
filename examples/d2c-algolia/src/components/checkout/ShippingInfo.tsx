import { useCheckoutForm } from "../../context/checkout";
import { Text, Heading, Button, Box, Flex } from "@chakra-ui/react";

interface IShippingInfo {
  type: "billing" | "shipping";
}

export const ShippingInfo = ({ type }: IShippingInfo): JSX.Element => {
  const {
    shippingAddress,
    billingAddress,
    setEditShippingForm,
    setEditBillingForm,
  } = useCheckoutForm();

  const address = type === "shipping" ? shippingAddress : billingAddress;

  const EditForm = () => {
    if (type === "shipping") {
      setEditShippingForm(true);
    }
    if (type === "billing") {
      setEditBillingForm(true);
    }
  };
  return (
    <Flex p={4} justifyContent="space-between">
      <Box>
        <Heading size="sm">
          {address.first_name} {address.last_name}
        </Heading>
        <Text>{address.line_1}</Text>
        {address.line_2 && <Text>{address.line_2}</Text>}
        <Text>
          {address.city}, {address.county}
        </Text>

        <Text>
          {address.country}, {address.postcode}
        </Text>
        <Text>{address.phone_number}</Text>
      </Box>

      <Button onClick={() => EditForm()}>Edit</Button>
    </Flex>
  );
};

export default ShippingInfo;
