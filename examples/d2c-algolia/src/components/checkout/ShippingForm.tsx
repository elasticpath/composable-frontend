import { useFormik } from "formik";
import { useCheckoutForm } from "../../context/checkout";
import {
  FormControl,
  FormLabel,
  Button,
  Box,
  Input,
  Flex,
} from "@chakra-ui/react";

interface FormValues {
  first_name: string;
  last_name: string;
  line_1: string;
  line_2: string;
  city: string;
  county: string;
  country: string;
  postcode: string;
  phone_number: string;
  instructions: string;
}

interface IShippingForm {
  nextFormStep: () => void;
  type: "shipping" | "billing";
}

export default function ShippingForm({
  nextFormStep,
  type,
}: IShippingForm): JSX.Element {
  const {
    setShippingFormValues,
    billingAddress,
    shippingAddress,
    setEditShippingForm,
    setBillingFormValues,
    isSameAddress,
    setEditBillingForm,
  } = useCheckoutForm();

  const address = type === "shipping" ? shippingAddress : billingAddress;

  let initialValues: FormValues = {
    first_name: address.first_name || "",
    last_name: address.last_name || "",
    line_1: address.line_1 || "",
    line_2: address.line_2 || "",
    city: address.city || "",
    county: address.county || "",
    country: address.country || "",
    postcode: address.postcode || "",
    phone_number: address.phone_number || "",
    instructions: address.instructions || "",
  };

  const { handleSubmit, handleChange, values, isValid } = useFormik({
    initialValues,
    onSubmit: (values) => {
      if (type === "shipping") {
        setShippingFormValues(values);
        setEditShippingForm(false);
        if (isSameAddress) nextFormStep();
      }
      if (type === "billing") {
        setBillingFormValues(values);
        setEditBillingForm(false);
        nextFormStep();
      }
    },
  });

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Flex gap={4} pb={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="first_name">First Name</FormLabel>
            <Input
              id="first_name"
              type="text"
              onChange={handleChange}
              value={values.first_name}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="last_name">Last Name</FormLabel>
            <Input
              id="last_name"
              type="text"
              onChange={handleChange}
              value={values.last_name}
            />
          </FormControl>
        </Flex>
        <Flex gap={4} pb={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="line_1">Street Address</FormLabel>
            <Input
              id="line_1"
              type="text"
              onChange={handleChange}
              value={values.line_1}
            />
          </FormControl>
        </Flex>
        <Box pb={4}>
          <FormLabel htmlFor="line_2">Extended Address</FormLabel>
          <Input
            id="line_2"
            type="text"
            onChange={handleChange}
            value={values.line_2}
          />
        </Box>
        <Flex gap={4} pb={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="city">City</FormLabel>
            <Input
              id="city"
              type="text"
              onChange={handleChange}
              value={values.city}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="county">County</FormLabel>
            <Input
              id="county"
              type="text"
              onChange={handleChange}
              value={values.county}
            />
          </FormControl>
        </Flex>
        <Flex gap={4} pb={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="postcode">Postal Code</FormLabel>
            <Input
              id="postcode"
              type="text"
              onChange={handleChange}
              value={values.postcode}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="country">Country</FormLabel>
            <Input
              id="country"
              type="text"
              onChange={handleChange}
              value={values.country}
            />
          </FormControl>
          {/* <CountriesSelect value={values.country} onChange={handleChange} /> */}
        </Flex>
        <Box pb={4}>
          <FormLabel htmlFor="phone_number">Phone Number</FormLabel>
          <Input
            id="phone_number"
            type="text"
            onChange={handleChange}
            value={values.phone_number}
          />
        </Box>
        <Box pb={4}>
          <FormLabel htmlFor="instructions">Instruction</FormLabel>
          <Input
            id="instructions"
            type="text"
            onChange={handleChange}
            value={values.instructions}
          />
        </Box>
        <Box>
          <Button type="submit" disabled={!isValid}>
            {type === "shipping" && !isSameAddress
              ? "Save & Update"
              : "Continue to payment"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
