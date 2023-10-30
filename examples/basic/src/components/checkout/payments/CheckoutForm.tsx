import { Form, Formik } from "formik";
import {
  CheckoutForm as CheckoutFormType,
  checkoutFormSchema,
} from "../form-schema/checkout-form-schema";
import { ConfirmPaymentResponse, PaymentRequestBody } from "@moltin/sdk";
import ShippingForm from "../ShippingForm";
import CustomFormControl from "../CustomFormControl";
import BillingForm from "../BillingForm";
import { useCart, useStore } from "@elasticpath/react-shopper-hooks";
import EpStripePayment from "./EpStripePayment";
import { confirmOrder, makePayment } from "../../../services/checkout";
import { useState } from "react";
import { CheckoutFormComponent } from "../types/checkout-form";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { toFormikValidationSchema } from "zod-formik-adapter";

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

const CheckoutForm: CheckoutFormComponent = ({
  showCompletedOrder,
}): JSX.Element => {
  const { client } = useStore();
  const { stripeIntent } = useCart();

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
      <div className="mb-8">
        <div className="flex" role="list">
          {steps.map((step, stepIdx) => (
            <div className="flex items-center text-sm" key={step.name}>
              <button
                type="button"
                className={`${step.isActive ? "text-brand-primary" : ""}`}
                onClick={step.handler}
              >
                {step.name}
              </button>
              {stepIdx !== steps.length - 1 ? (
                <ChevronRightIcon height={12} width={12} className="mx-4" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {clientSecret ? (
        <EpStripePayment
          clientSecret={clientSecret}
          showCompletedOrder={() => {
            if (paymentResponse) {
              confirmOrder(
                paymentResponse.data.relationships.order.data.id,
                paymentResponse.data.id,
                client,
              ).then(() => showCompletedOrder(paymentResponse, checkoutForm!));
            }
          }}
        />
      ) : (
        <Formik
          initialValues={initialValues as CheckoutFormType}
          validationSchema={toFormikValidationSchema(checkoutFormSchema)}
          onSubmit={async (validatedValues) => {
            const {
              personal,
              shippingAddress,
              billingAddress,
              sameAsShipping,
            } = validatedValues;
            setCheckoutForm(validatedValues);

            const orderResponse = await stripeIntent(
              personal.email,
              shippingAddress,
              sameAsShipping,
              billingAddress ?? undefined,
            );

            if (orderResponse?.data.id) {
              const payment: PaymentRequestBody = {
                gateway: "elastic_path_payments_stripe",
                method: "purchase",
                payment_method_types: ["card"],
              };
              const paymentResponse = await makePayment(
                payment,
                orderResponse.data.id,
                client,
              );
              setPaymentResponse(paymentResponse);
            }
          }}
        >
          {({ handleChange, values, isSubmitting }) => (
            <Form>
              <div className="grid grid-rows-[1fr] gap-10">
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-semibold">
                    {" "}
                    Contact Information
                  </h2>
                  <CustomFormControl
                    id="email"
                    type="email"
                    name="personal.email"
                    autoComplete="email"
                    aria-label="Email Address"
                    helperText="required for guest checkout"
                    label="Email"
                    isRequired={true}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold"> Shipping Address</h2>
                  <ShippingForm />
                  <label className="w-fit cursor-pointer">
                    <input
                      className="mb-4 mr-2 accent-brand-primary"
                      type="checkbox"
                      id="same-as-shipping"
                      name="sameAsShipping"
                      onChange={handleChange}
                      checked={values.sameAsShipping}
                    />
                    Same as shipping address?
                  </label>
                </div>
                {!values.sameAsShipping && <BillingForm />}

                <button
                  className="primary-btn w-fit justify-self-end disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-4">Paying...</span>
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                    </>
                  ) : (
                    "Checkout Now"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default CheckoutForm;
