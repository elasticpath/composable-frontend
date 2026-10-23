import { ANALYTICS_HEADER, ANALYTICS_OFF } from "@epcc-sdk/visitor"
import type { Client } from "../client/client"

export function createAnalyticsOffInterceptor(): Parameters<
  Client["interceptors"]["request"]["use"]
>[0] {
  return function analyticsOffInterceptor(request, _options) {
    request.headers.set(ANALYTICS_HEADER, ANALYTICS_OFF)
    return request
  }
}
