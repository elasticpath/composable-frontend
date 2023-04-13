import { Form, Formik } from "formik";
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  GridItem,
  Heading,
  Flex,
  Box,
} from "@chakra-ui/react";
import {
  CheckoutForm as CheckoutFormType,
  checkoutFormSchema,
} from "./form-schema/checkout-form-schema";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { ConfirmPaymentResponse, PaymentRequestBody } from "@moltin/sdk";
import ShippingForm from "./ShippingForm";
import CustomFormControl from "./CustomFormControl";
import BillingForm from "./BillingForm";
import { useCart } from "@elasticpath/react-shopper-hooks";
import EpStripePayment from "./payments/ep-stripe-payment/EpStripePayment";
import { confirmOrder, makePayment } from "../../services/checkout";
import { useState } from "react";

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
  checkout: ReturnType<typeof useCart>["stripeIntent"];
  showCompletedOrder: (
    paymentResponse: ConfirmPaymentResponse,
    checkoutForm: CheckoutFormType
  ) => void;
}

export default function StripeTypeCheckoutForm({
  checkout,
  showCompletedOrder,
}: ICheckoutForm): JSX.Element {
  const [paymentResponse, setPaymentResponse] =
    useState<ConfirmPaymentResponse>();
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormType>();
  const clientSecret = paymentResponse?.data.payment_intent.client_secret || "";

  const steps = [
    {
      name: "Cart",
      isActive: !clientSecret,
      handler: () => paymentResponse && setPaymentResponse(undefined),
    },
    { name: "Billing Information", isActive: clientSecret },
  ];

  return (
    <>
      <Box mb={3}>
        <Flex role="list" justifyContent="center">
          {steps.map((step, stepIdx) => (
            <Flex key={step.name} alignItems="center">
              <Button
                onClick={step.handler}
                variant="text"
                color={step.isActive ? "brand.primary" : ""}
              >
                {step.name}
              </Button>

              {stepIdx !== steps.length - 1 ? (
                <ChevronRightIcon mx={4} />
              ) : null}
            </Flex>
          ))}
        </Flex>
      </Box>

      {clientSecret ? (
        <EpStripePayment
          clientSecret={clientSecret}
          showCompletedOrder={() => {
            if (paymentResponse) {
              confirmOrder(
                paymentResponse.data.relationships.order.data.id,
                paymentResponse.data.id
              ).then(() => showCompletedOrder(paymentResponse, checkoutForm!));
            }
          }}
        />
      ) : (
        <Formik
          initialValues={initialValues as CheckoutFormType}
          validationSchema={checkoutFormSchema}
          onSubmit={async (validatedValues) => {
            const {
              personal,
              shippingAddress,
              billingAddress,
              sameAsShipping,
            } = validatedValues;
            setCheckoutForm(validatedValues);

            const orderResponse = await checkout(
              personal.email,
              shippingAddress,
              sameAsShipping,
              billingAddress ?? undefined
            );

            if (orderResponse?.data.id) {
              const payment: PaymentRequestBody = {
                gateway: "elastic_path_payments_stripe",
                method: "purchase",
                payment_method_types: ["card"],
              };
              const paymentResponse = await makePayment(
                payment,
                orderResponse.data.id
              );
              setPaymentResponse(paymentResponse);
            }
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
                  Checkout Now
                </Button>
              </Grid>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
}
