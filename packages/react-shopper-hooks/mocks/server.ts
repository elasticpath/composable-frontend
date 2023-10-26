import { setupServer } from "msw/node"
import { shopperHandlers } from "./handlers"

export const server = setupServer(...shopperHandlers)
