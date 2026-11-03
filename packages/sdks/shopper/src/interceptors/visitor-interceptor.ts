import { visitorHeaders } from "@epcc-sdk/visitor"
import type { Visitor } from "@epcc-sdk/visitor"
import type { Client } from "../client/client"

export type VisitorSource = Visitor | (() => Visitor | Promise<Visitor>)

export function createVisitorInterceptor(
  source: VisitorSource,
): Parameters<Client["interceptors"]["request"]["use"]>[0] {
  return async function visitorInterceptor(request, _options) {
    const visitor = typeof source === "function" ? await source() : source
    for (const [name, value] of Object.entries(visitorHeaders(visitor))) {
      request.headers.set(name, value)
    }
    return request
  }
}
