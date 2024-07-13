import { server } from "./mocks/server"
import { beforeAll, afterAll, afterEach } from "vitest"

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
