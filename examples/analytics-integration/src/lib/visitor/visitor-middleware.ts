import { NextResponse } from "next/server";
import { resolveVisitor } from "@epcc-sdk/sdks-shopper";
import { Middleware } from "../middleware/run-middleware";
import { consent } from "./consent";

export const visitorMiddleware: Middleware = async (
  req,
  _event,
  context,
  next,
) => {
  const { visitor, setCookies } = await resolveVisitor(req, { consent });

  const response = await next({ ...context, visitor });

  for (const setCookie of setCookies) {
    const parsed = new NextResponse(null, {
      headers: { "Set-Cookie": setCookie },
    });
    for (const cookie of parsed.cookies.getAll()) {
      response.cookies.set(
        cookie.value ? cookie : { ...cookie, value: "", maxAge: 0 },
      );
    }
  }

  return response;
};
