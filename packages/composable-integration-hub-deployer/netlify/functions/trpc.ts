import { createExpressMiddleware } from "@trpc/server/adapters/express"
import { createContext } from "../lib/server"
import { Handler } from "@netlify/functions"
import express from "express"
import serverless from "serverless-http"
import { appRouter } from "../lib/router"

const app = express()
app.use(express.json())
app.use(
  "/.netlify/functions/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

// @ts-ignore
const handler: Handler = serverless(app)

export { handler }
