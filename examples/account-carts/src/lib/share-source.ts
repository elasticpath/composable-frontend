import "server-only"

import type { ShareSource } from "./open-share"
import { readSharedCart } from "./shared-cart-reader"
import { lookupShareByToken } from "./shares-store"

export const shareSource: ShareSource = {
  lookupShare: lookupShareByToken,
  readSharedCart,
}
