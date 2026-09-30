import { http, HttpResponse } from "msw"

const BASE_URL = "https://api.elasticpath.com"

// Track request counts for testing retry behavior
let authRequestCount = 0
let productRequestCount = 0

export function resetRequestCounts() {
  authRequestCount = 0
  productRequestCount = 0
}

export function getRequestCounts() {
  return { authRequestCount, productRequestCount }
}

// Mock token data
export const mockTokenData = {
  access_token: "mock-access-token-12345",
  token_type: "Bearer",
  expires_in: 3600,
  expires: Math.floor(Date.now() / 1000) + 3600,
  identifier: "implicit",
  client_id: "test-client-id",
}

export const mockClientCredentialsToken = {
  access_token: "mock-admin-token-67890",
  token_type: "Bearer",
  expires_in: 3600,
  expires: Math.floor(Date.now() / 1000) + 3600,
  identifier: "client_credentials",
  client_id: "admin-client-id",
}

// Mock product data (old SDK format - v2 API)
export const mockProductsV2 = {
  data: [
    {
      id: "product-1",
      type: "product",
      name: "Test Product 1",
      slug: "test-product-1",
      sku: "TP001",
      description: "A test product",
      status: "live",
      commodity_type: "physical",
    },
    {
      id: "product-2",
      type: "product",
      name: "Test Product 2",
      slug: "test-product-2",
      sku: "TP002",
      description: "Another test product",
      status: "live",
      commodity_type: "physical",
    },
  ],
  meta: {
    results: {
      total: 2,
    },
  },
}

// Mock product data (new SDK format - catalog API)
export const mockCatalogProducts = {
  data: [
    {
      id: "catalog-product-1",
      type: "product",
      attributes: {
        name: "Catalog Product 1",
        slug: "catalog-product-1",
        sku: "CP001",
        description: "A catalog product",
        status: "live",
      },
    },
  ],
  meta: {
    results: {
      total: 1,
    },
  },
}

// Mock PIM products
export const mockPimProducts = {
  data: [
    {
      id: "pim-product-1",
      type: "product",
      attributes: {
        name: "PIM Product 1",
        commodity_type: "physical",
        sku: "PIM001",
        status: "live",
      },
    },
  ],
  meta: {
    results: {
      total: 1,
    },
  },
}

// State for controlling test scenarios
let shouldReturn401 = false
let shouldReturn429 = false
let return401Count = 0

export function setReturn401(value: boolean, count = 1) {
  shouldReturn401 = value
  return401Count = count
}

export function setReturn429(value: boolean) {
  shouldReturn429 = value
}

export const handlers = [
  // OAuth token endpoint - implicit and client_credentials
  http.post(`${BASE_URL}/oauth/access_token`, async ({ request }) => {
    authRequestCount++

    const body = await request.text()
    const params = new URLSearchParams(body)
    const grantType = params.get("grant_type")

    if (grantType === "client_credentials") {
      return HttpResponse.json(mockClientCredentialsToken)
    }

    // Default to implicit grant
    return HttpResponse.json(mockTokenData)
  }),

  // Old SDK products endpoint (v2)
  http.get(`${BASE_URL}/v2/products`, ({ request }) => {
    productRequestCount++

    // Check for 401 scenario
    if (shouldReturn401 && return401Count > 0) {
      return401Count--
      if (return401Count === 0) {
        shouldReturn401 = false
      }
      return new HttpResponse(JSON.stringify({ errors: [{ status: 401 }] }), {
        status: 401,
      })
    }

    // Check for 429 scenario
    if (shouldReturn429) {
      shouldReturn429 = false
      return new HttpResponse(JSON.stringify({ errors: [{ status: 429 }] }), {
        status: 429,
      })
    }

    // Verify authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new HttpResponse(
        JSON.stringify({ errors: [{ status: 401, detail: "Missing auth" }] }),
        { status: 401 }
      )
    }

    return HttpResponse.json(mockProductsV2)
  }),

  // New SDK catalog products endpoint
  http.get(`${BASE_URL}/catalog/products`, ({ request }) => {
    productRequestCount++

    // Check for 401 scenario
    if (shouldReturn401 && return401Count > 0) {
      return401Count--
      if (return401Count === 0) {
        shouldReturn401 = false
      }
      return new HttpResponse(JSON.stringify({ errors: [{ status: 401 }] }), {
        status: 401,
      })
    }

    // Check for 429 scenario
    if (shouldReturn429) {
      shouldReturn429 = false
      return new HttpResponse(JSON.stringify({ errors: [{ status: 429 }] }), {
        status: 429,
      })
    }

    // Verify authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new HttpResponse(
        JSON.stringify({ errors: [{ status: 401, detail: "Missing auth" }] }),
        { status: 401 }
      )
    }

    return HttpResponse.json(mockCatalogProducts)
  }),

  // PIM products endpoint
  http.get(`${BASE_URL}/pcm/products`, ({ request }) => {
    productRequestCount++

    // Verify authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new HttpResponse(
        JSON.stringify({ errors: [{ status: 401, detail: "Missing auth" }] }),
        { status: 401 }
      )
    }

    return HttpResponse.json(mockPimProducts)
  }),

  // Catch-all for debugging
  http.all(`${BASE_URL}/*`, ({ request }) => {
    console.log(`Unhandled request: ${request.method} ${request.url}`)
    return new HttpResponse(null, { status: 404 })
  }),
]
