import { useFormik } from "formik";
import {
  FormControl,
  FormLabel,
  Button,
  Box,
  FormErrorMessage,
  Input,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useCart } from "@elasticpath/react-shopper-hooks";

interface FormValues {
  promoCode: string;
}

export const Promotion = (): JSX.Element => {
  const { addPromotionToCart, state } = useCart();

  const initialValues: FormValues = {
    promoCode: "",
  };

  const { handleSubmit, handleChange, values, errors } = useFormik({
    initialValues,
    onSubmit: async (values) => {
      await addPromotionToCart(values.promoCode);
      // TODO handle invalid promo code setErrors(error.errors[0].detail);
    },
  });

  const shouldDisableInput =
    state.kind !== "present-cart-state" ||
    state.groupedItems.promotion.length > 0;

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box display="flex">
          <FormControl isInvalid={Object.keys(errors).length > 0}>
            <FormLabel htmlFor="name">Gift card or discount code</FormLabel>
            <Flex gap="16px">
              <Input
                id="promoCode"
                onChange={handleChange}
                value={values.promoCode}
                disabled={shouldDisableInput}
              />
              <Button
                width="120px"
                bg={useColorModeValue("blue.900", "blue.50")}
                type="submit"
                disabled={!values.promoCode}
                color={useColorModeValue("white", "gray.900")}
                _hover={{
                  backgroundColor: "blue.700",
                  boxShadow: "m",
                }}
              >
                Apply
              </Button>
            </Flex>

            <FormErrorMessage>
              <>{errors}</>
            </FormErrorMessage>
          </FormControl>
        </Box>
      </form>
    </Box>
  );
};
