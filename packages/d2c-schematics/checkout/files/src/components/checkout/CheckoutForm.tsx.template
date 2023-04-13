import { Form, Formik } from "formik";
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  GridItem,
  Heading,
} from "@chakra-ui/react";
import {
  CheckoutForm as CheckoutFormType,
  checkoutFormSchema,
} from "./form-schema/checkout-form-schema";
import { ConfirmPaymentResponse } from "@moltin/sdk";
import ShippingForm from "./ShippingForm";
import CustomFormControl from "./CustomFormControl";
import BillingForm from "./BillingForm";
import BrainTreePayment from "./payments/BraintreePayment";
import { useCart } from "@elasticpath/react-shopper-hooks";
import { usePaymentGateway } from "@elasticpath/react-shopper-hooks";

const initialValues: Partial<CheckoutFormType> = {
  personal: {
    email: "",
  },
  sameAsShipping: true,
  shippingAddress: {
    first_name: "",
    last_name: "",
    line_1: "",
    country: "",
    region: "",
    postcode: "",
  },
};

interface ICheckoutForm {
  checkout: ReturnType<typeof useCart>["checkout"];
  showCompletedOrder: (
    paymentResponse: ConfirmPaymentResponse,
    checkoutForm: CheckoutFormType
  ) => void;
}

export default function CheckoutForm({
  checkout,
  showCompletedOrder,
}: ICheckoutForm): JSX.Element {
  const { state } = usePaymentGateway();

  return (
    <Formik
      initialValues={initialValues as CheckoutFormType}
      validationSchema={checkoutFormSchema}
      onSubmit={async (validatedValues) => {
        const { personal, shippingAddress, billingAddress, sameAsShipping } =
          validatedValues;

        if (state.kind === "uninitialized-payment-gateway-register-state") {
          throw Error(
            "Unable to process payment due to no payment gateway being registered!"
          );
        }

        const payment = await state.resolvePayment();

        const response = await checkout(
          personal.email,
          shippingAddress,
          payment,
          sameAsShipping,
          billingAddress ?? undefined
        );

        showCompletedOrder(response, validatedValues);
      }}
    >
      {({ handleChange, values, isSubmitting }) => (
        <Form>
          <Grid gridTemplateRows="1fr" gap={10}>
            <Heading as="h2" fontSize="lg" fontWeight="medium">
              Contact Information
            </Heading>
            <GridItem>
              <CustomFormControl
                id="email"
                type="email"
                name="personal.email"
                autoComplete="email"
                helperText="required for guest checkout"
                label="Email"
                isRequired={true}
              />
            </GridItem>
            <Heading as="h2" fontSize="lg" fontWeight="medium">
              Shipping Address
            </Heading>
            <GridItem>
              <ShippingForm />
            </GridItem>
            <Heading as="h2" fontSize="lg" fontWeight="medium">
              Billing Address
            </Heading>
            <GridItem>
              <FormControl>
                <Checkbox
                  id="same-as-shipping"
                  name="sameAsShipping"
                  onChange={handleChange}
                  isChecked={values.sameAsShipping}
                  colorScheme="blue"
                  mb={4}
                >
                  Same as shipping address?
                </Checkbox>
              </FormControl>
              {!values.sameAsShipping && <BillingForm />}
            </GridItem>
            <BrainTreePayment />
            <Button
              justifySelf="right"
              bg="brand.primary"
              color="white"
              _hover={{
                backgroundColor: "brand.highlight",
                boxShadow: "md",
              }}
              variant="solid"
              type="submit"
              isLoading={isSubmitting}
              spinnerPlacement="end"
              disabled={isSubmitting}
              loadingText="Paying"
            >
              Pay Now
            </Button>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
