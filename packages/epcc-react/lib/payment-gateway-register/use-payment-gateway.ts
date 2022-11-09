import { useContext } from "react";
import { PGRContext } from "./payment-gateway-provider";
import {
  PGRAction,
  ResolvePaymentFunction,
  SupportedGateway,
} from "./types/payment-gateway-reducer-types";

export function usePaymentGateway() {
  const context = useContext(PGRContext);

  if (context === undefined) {
    throw new Error("usePaymentGateway must be used within a PGRProvider");
  }

  const { state, dispatch } = context;

  return {
    registerGateway: _registerGateway(dispatch),
    state,
  };
}

function _registerGateway(dispatch: (action: PGRAction) => void) {
  return (
    resolvePayment: ResolvePaymentFunction,
    type: SupportedGateway
  ): void => {
    dispatch({
      type: "update-payment-gateway-register",
      payload: { type, resolvePayment },
    });
  };
}
