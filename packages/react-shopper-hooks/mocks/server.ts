import { setupServer } from "msw/node"
import { shopperHandlers } from "./handlers/shopper"

export const server = setupServer(...shopperHandlers)
