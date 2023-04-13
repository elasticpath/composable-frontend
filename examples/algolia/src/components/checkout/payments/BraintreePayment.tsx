import { useCallback, useEffect, useState } from "react";
import dropin, { Dropin } from "braintree-web-drop-in";
import { Box } from "@chakra-ui/react";
import { BRAINTREE_AUTH_KEY } from "../../../lib/resolve-braintree-env";
import { usePaymentGateway } from "@elasticpath/react-shopper-hooks";
import { PaymentRequestBody } from "@moltin/sdk";

export const BrainTreePayment = (): JSX.Element => {
  const { registerGateway } = usePaymentGateway();

  const [braintreeInstance, setBraintreeInstance] = useState<
    Dropin | undefined
  >(undefined);

  const initializeBraintree = useCallback(async () => {
    const braintreeInstanceTemp = await dropin.create({
      authorization: BRAINTREE_AUTH_KEY,
      container: "#braintree-drop-in",
      paypal: { flow: "checkout" },
    });
    setBraintreeInstance(braintreeInstanceTemp);

    const resolveNonce = async function (): Promise<PaymentRequestBody> {
      if (!braintreeInstanceTemp) {
        throw Error(
          "Tried to resolve nonce before braintree instance was initialized"
        );
      }

      try {
        const { nonce } = await braintreeInstanceTemp.requestPaymentMethod();

        return {
          method: "purchase",
          gateway: "braintree",
          payment: nonce,
          options: {
            payment_method_nonce: true,
          },
        };
      } catch (err) {
        console.error("error braintree: ", err);
        throw err;
      }
    };

    registerGateway(resolveNonce, "braintree");
  }, [registerGateway]);

  useEffect(() => {
    if (!braintreeInstance) {
      initializeBraintree();
    }
  }, [initializeBraintree, braintreeInstance]);

  return <Box id="braintree-drop-in"></Box>;
};

export default BrainTreePayment;
