import Conf from "conf"
import { Schema } from "conf/dist/source/types"
import { CommandContext } from "../types/command"
import fetch from "node-fetch"

export const storeSchema = {
  credentials: {
    type: "object",
    properties: {
      access_token: { type: "string" },
      expires: { type: "number" },
      expires_in: { type: "number" },
      identifier: { type: "string" },
      refresh_token: { type: "string" },
      token_type: { type: "string" },
    },
  },
  region: {
    enum: ["eu-west", "us-east"],
    type: "string",
    default: "eu-west",
  },
}

export function createCommandContext(): CommandContext {
  const store = new Conf({
    projectName: "composable-cli",
    schema: storeSchema as Schema<Record<string, unknown>>,
  })

  return {
    store,
    requester: fetch,
    stdout: process.stdout,
    stderr: process.stderr,
  }
}
