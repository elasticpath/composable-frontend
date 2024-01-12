import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { ConfirmPaymentResponse, ConfirmPaymentBody } from "@moltin/sdk"

export type UseOrderConfirmReq = {
  orderId: string
  transactionId: string
  options: ConfirmPaymentBody
}

export const useOrderConfirm = (
  options?: UseMutationOptions<
    ConfirmPaymentResponse,
    Error,
    UseOrderConfirmReq
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({
      orderId,
      transactionId,
      options,
    }: UseOrderConfirmReq) => {
      return client.Orders.Confirm(orderId, transactionId, options)
    },
    ...options,
  })
}
