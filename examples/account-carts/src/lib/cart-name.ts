export const CART_NAME_MAX_LENGTH = 255

export type CartNameResult =
  | { ok: true; name: string }
  | { ok: false; problem: string }

const CONTROL_CHARACTER = /\p{Cc}/u

export function parseCartName(input: string): CartNameResult {
  const name = input.trim()

  if (name.length === 0) {
    return { ok: false, problem: "Give the cart a name." }
  }

  if (name.length > CART_NAME_MAX_LENGTH) {
    return {
      ok: false,
      problem: `Use ${CART_NAME_MAX_LENGTH} characters or fewer.`,
    }
  }

  if (CONTROL_CHARACTER.test(name)) {
    return { ok: false, problem: "Use letters, numbers and punctuation only." }
  }

  return { ok: true, name }
}
