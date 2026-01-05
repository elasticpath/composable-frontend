import { NextRequest, NextFetchEvent, NextResponse } from "next/server";
import { AccessTokenResponse } from "@epcc-sdk/sdks-shopper";

export interface MiddlewareContext {
  token?: AccessTokenResponse;
}

export type Middleware = (
  req: NextRequest,
  event: NextFetchEvent,
  context: MiddlewareContext,
  next: (ctx: MiddlewareContext) => Promise<NextResponse>,
) => Promise<NextResponse>;

export function composeMiddleware(
  middlewares: Middleware[],
  initialContext: MiddlewareContext = {},
): (req: NextRequest, event: NextFetchEvent) => Promise<NextResponse> {
  return (req, event) => {
    const dispatch = (
      i: number,
      context: MiddlewareContext,
    ): Promise<NextResponse> => {
      if (i >= middlewares.length) {
        return Promise.resolve(NextResponse.next());
      }
      const currentMiddleware = middlewares[i]!;
      return currentMiddleware(req, event, context, (ctx: MiddlewareContext) =>
        dispatch(i + 1, ctx),
      );
    };
    return dispatch(0, initialContext);
  };
}
