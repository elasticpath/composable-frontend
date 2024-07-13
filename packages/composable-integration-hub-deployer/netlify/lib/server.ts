import { initTRPC, inferAsyncReturnType } from "@trpc/server"
import { CreateExpressContextOptions } from "@trpc/server/adapters/express"

// express created for each request
export const createContext = ({
  req,
  res: _res,
}: CreateExpressContextOptions) => ({
  creds: req.headers.authorization,
})

type Context = inferAsyncReturnType<typeof createContext>
export const t = initTRPC.context<Context>().create()

import { TRPCError } from "@trpc/server"

const isAuthed = t.middleware(({ next, ctx }) => {
  const { creds } = ctx
  if (!creds || !creds.startsWith("Bearer ")) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  const token = creds.substring(7, creds.length)
  return next({
    ctx: {
      creds: token,
    },
  })
})
// you can reuse this for any procedure
export const protectedProcedure = t.procedure.use(isAuthed)
