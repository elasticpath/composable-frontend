import jwt_decode from "jwt-decode"
import { CustomerJwt, customerJwtSchema } from "./customer-jwt-schema"
import {
  AlgoliaIntegrationCreateFailureResult,
  resolveErrorResponse,
} from "@elasticpath/mason-common"

export function decodeCustomerJwt(
  jwt: string
):
  | { success: true; parsedJwt: CustomerJwt }
  | AlgoliaIntegrationCreateFailureResult {
  let decodedJwt: unknown
  try {
    decodedJwt = jwt_decode(jwt)
  } catch (err) {
    return resolveErrorResponse(
      "CUSTOMER_JWT_DECODE",
      err instanceof Error ? err : undefined
    )
  }

  const parsedJwtResult = customerJwtSchema.safeParse(decodedJwt)

  if (parsedJwtResult.success) {
    return {
      success: true,
      parsedJwt: parsedJwtResult.data,
    }
  }

  const { name, message, errors } = parsedJwtResult.error

  return resolveErrorResponse(
    "CUSTOMER_JWT_DECODE",
    new Error(`${name} - ${message} - ${JSON.stringify(errors)}`)
  )
}
