import { NextResponse } from "next/server";
import { resolveVisitor } from "@epcc-sdk/visitor";
import { Middleware } from "../middleware/run-middleware";
import { consent } from "./consent";

export const visitorMiddleware: Middleware = async (
  req,
  _event,
  context,
  next,
) => {
  const { setCookies } = await resolveVisitor(req, { consent });

  const response = await next(context);

  for (const setCookie of setCookies) {
    const parsed = new NextResponse(null, {
      headers: { "Set-Cookie": setCookie },
    });
    for (const cookie of parsed.cookies.getAll()) {
      response.cookies.set(cookie);
    }
  }

  return response;
};
