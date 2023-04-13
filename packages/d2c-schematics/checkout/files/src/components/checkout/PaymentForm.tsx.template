import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { Button } from "@chakra-ui/react";
interface CheckoutParams {
  totalPrice: string;
  onPayOrder: (...args: any) => any;
}

export const PaymentForm = ({
  onPayOrder,
  totalPrice,
}: CheckoutParams): JSX.Element => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);

  const onPayment = async () => {
    let payment;
    setIsLoading(true);
    try {
      if (stripe && elements)
        payment = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: "",
          },
        });
      await onPayOrder(payment);
      setIsLoading(false);
    } catch (paymentError) {
      console.error({ paymentError });
      return setIsLoading(false);
    }
  };

  return (
    <div className="checkout">
      <p className="card-title">payment-card</p>
      <form onSubmit={onPayment}>
        <CardElement />

        <Button type="submit">
          {!isLoading ? (
            "pay" + " " + totalPrice
          ) : (
            <span className="circularLoader" aria-label="loading" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default PaymentForm;
