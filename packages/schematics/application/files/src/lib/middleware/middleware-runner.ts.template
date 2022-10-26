import { NonEmptyArray } from "../types/non-empty-array";
import { NextRequest, NextResponse } from "next/server";

export interface NextResponseFlowResult {
  shouldReturn: boolean;
  resultingResponse: NextResponse;
}

interface RunnableMiddlewareEntryOptions {
  exclude?: NonEmptyArray<string>;
}

interface RunnableMiddlewareEntry {
  runnable: RunnableMiddleware;
  options?: RunnableMiddlewareEntryOptions;
}

export function middlewareRunner(
  ...middleware: NonEmptyArray<RunnableMiddleware | RunnableMiddlewareEntry>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let lastResult: NextResponseFlowResult = {
      shouldReturn: false,
      resultingResponse: NextResponse.next(),
    };

    for (const m of middleware) {
      const toRun: RunnableMiddlewareEntry =
        "runnable" in m ? m : { runnable: m };

      const { runnable, options } = toRun;

      if (shouldRun(req.nextUrl.pathname, options?.exclude)) {
        lastResult = await runnable(req, lastResult.resultingResponse);
      }

      if (lastResult.shouldReturn) {
        return lastResult.resultingResponse;
      }
    }
    return lastResult.resultingResponse;
  };
}

function shouldRun(
  pathname: string,
  excluded?: NonEmptyArray<string>
): boolean {
  if (excluded) {
    for (const path of excluded) {
      if (pathname.startsWith(path)) {
        return false;
      }
    }
  }

  return true;
}

type RunnableMiddleware = (
  req: NextRequest,
  previousResponse: NextResponse
) => Promise<NextResponseFlowResult>;
