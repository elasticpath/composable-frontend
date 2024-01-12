import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { ConfirmPaymentResponse, PaymentRequestBody } from "@moltin/sdk"

export type UsePaymentsReq = {
  orderId: string
  payment: PaymentRequestBody
}

export const usePayments = (
  options?: UseMutationOptions<ConfirmPaymentResponse, Error, UsePaymentsReq>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({ orderId, payment }: UsePaymentsReq) => {
      return client.Orders.Payment(orderId, payment)
    },
    ...options,
  })
}
