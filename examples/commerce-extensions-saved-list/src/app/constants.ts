export const COOKIE_PREFIX_KEY = "_store"

/** Implicit token used for catalog reads. Public by design. */
export const CREDENTIALS_COOKIE_KEY = `${COOKIE_PREFIX_KEY}_ep_credentials`

/** HMAC-signed, httpOnly. Names the account every saved list call is scoped to. */
export const SESSION_COOKIE_KEY = `${COOKIE_PREFIX_KEY}_shopper_session`

/**
 * The slug of the Custom API created by `pnpm provision`. Entries live at
 * /v2/extensions/saved-list-items, and the same records are reachable by id at
 * /v2/settings/extensions/custom-apis/{id}/entries.
 */
export const SAVED_LIST_SLUG = "saved-list-items"

/** Custom API Entries use the Custom API's api_type as their `type`. */
export const SAVED_LIST_API_TYPE = "saved_list_item_ext"

export const SESSION_LIFETIME_SECONDS = 60 * 60 * 24
