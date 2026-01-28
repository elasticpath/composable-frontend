import { setupServer } from "msw/node"
import { handlers, resetRequestCounts } from "./handlers"

// Create MSW server for Node.js environment
export const server = setupServer(...handlers)

// Setup function to be called in beforeAll
export function setupMswServer() {
  // Start the server before all tests
  server.listen({
    onUnhandledRequest: "warn",
  })
}

// Cleanup function to be called in afterAll
export function teardownMswServer() {
  server.close()
}

// Reset handlers between tests
export function resetMswHandlers() {
  server.resetHandlers()
  resetRequestCounts()
}

// Re-export utilities from handlers
export {
  resetRequestCounts,
  getRequestCounts,
  setReturn401,
  setReturn429,
  mockTokenData,
  mockClientCredentialsToken,
  mockProductsV2,
  mockCatalogProducts,
  mockPimProducts,
} from "./handlers"
