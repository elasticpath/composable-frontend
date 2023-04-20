import { setupServer } from "msw/node"
import { handlers } from "./handlers"
import { epccHandlers } from "./epcc-handlers"
// This configures a Service Worker with the given request handlers.
export const server = setupServer(...handlers, ...epccHandlers)
