import { CommandContext } from "../../types/command"
import { MiddlewareFunction } from "yargs"
import { hasUUID, setUUID } from "../../util/has-uuid"
import { uuidv7 } from "../../util/uuidv7"

export function createUUIDMiddleware(ctx: CommandContext): MiddlewareFunction {
  return async function uuidMiddleware(_argv: any) {
    const { store } = ctx

    if (hasUUID(store)) {
      return
    }

    setUUID(store, uuidv7())
    return
  }
}
