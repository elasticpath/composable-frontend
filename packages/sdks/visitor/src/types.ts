export type Purpose = "analytics" | "personalization"

export type ConsentResult =
  | { state: "granted"; purposes: Purpose[] }
  | { state: "none"; sessionId?: boolean }
  | { state: "objected" }

export type Visitor =
  | { kind: "lasting"; id: string; purposes: Purpose[] }
  | { kind: "session"; id: string }
  | { kind: "none" }
  | { kind: "objected" }

export type ConsentFunction = (
  request: Request,
) => ConsentResult | Promise<ConsentResult>

export type ResolveVisitorOptions = {
  consent: ConsentFunction
  cookieName?: string
  sessionCookieName?: string
  lifetimeSeconds?: number
}

export type ResolvedVisitor = {
  visitor: Visitor
  setCookies: string[]
}
