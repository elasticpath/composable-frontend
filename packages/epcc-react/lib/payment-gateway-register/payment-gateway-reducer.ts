import { PGRAction, PGRState } from "./types/payment-gateway-reducer-types";

export function pgrReducer(state: PGRState, action: PGRAction): PGRState {
  switch (action.type) {
    case "update-payment-gateway-register": {
      const { type, resolvePayment } = action.payload;
      return {
        kind: "registered-payment-gateway-register-state",
        resolvePayment,
        type,
      };
    }
    default:
      return state;
  }
}
