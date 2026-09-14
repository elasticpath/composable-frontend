# Account-scoped custom data on Commerce Extensions

A signed-in shopper saves products to a list. The list is the demo. The subject
is how to store custom data that belongs to one account on Elastic Path
Commerce Extensions, and how to authorize access to it.

Two platform facts set the shape of this example:

- **An implicit (shopper) token is read-only.** It cannot create, update or
  delete a Custom API Entry. Every write therefore goes through a server-side
  route holding a key with a secret, and the browser never talks to Elastic Path
  about the saved list at all.
- **Custom API Entries have no per-entry ownership.** Any token that may list
  entries can list _every_ shopper's entries. The `account_id` field on an entry
  is an ordinary string; nothing in the platform checks it. Checking it is the
  application's job.

Writing that check correctly is what this example teaches.

Guest shoppers are out of scope. A guest list lives in browser storage, and
merging one into an account at sign-in is a separate problem.

## Where the authorization lives

Three files, in the order a request passes through them:

| File                            | What it decides                                                                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/session.ts`            | Who the caller is. The session cookie is `httpOnly` and carries an HMAC over its payload, so a shopper cannot edit the account id inside it. The id is written once, at login, from Elastic Path's own response. |
| `src/lib/saved-list-context.ts` | Resolves that session into an account id and a store handle. Route handlers start here, so none of them can reach the store without a session.                                                                   |
| `src/lib/saved-list.ts`         | Every read and write. It takes the account id as a required argument, filters reads by it on the API _and_ again in memory, and re-reads an entry to compare owners before deleting it.                          |

The rules `saved-list.ts` keeps:

1. **The account id comes from the session, never from the request.** It is a
   required first argument, so no code path can forget it. A request body can
   only ever name a product.
2. **Reads are scoped twice.** `eq(account_id,…)` goes to the API, and the
   result is filtered again locally. A Custom API whose `account_id` field was
   provisioned wrong would return the whole store; the second check means that
   is an empty list, not a leak.
3. **A write against an existing entry re-reads it first.** An entry owned by
   somebody else gets the same answer as an entry that does not exist, so the
   delete route cannot be used to discover which entry ids are real.

A fourth, smaller one: account ids are interpolated into an Elastic Path filter
string, and filter values are not escaped. Anything that is not `[A-Za-z0-9_-]`
is rejected rather than sent.

`pnpm test` proves rule 1 and rule 3 directly — including a test where one
shopper asks to delete another shopper's entry by id — along with the cookie
tamper cases.

## Store Setup Requirements

Before this example runs, the store must have:

| Requirement                                                                                | Why                                                 | How to get it                              |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------ |
| A Custom API with slug `saved-list-items`, and `account_id` and `product_id` string fields | Where saved entries live                            | `pnpm provision` (below)                   |
| A published catalog with at least one product                                              | The products a shopper can save                     | Publish a catalog in Commerce Manager      |
| A password profile on an authentication realm                                              | Shoppers sign in with email and password            | Commerce Manager, then copy the profile id |
| An account with at least one account member                                                | Somebody to sign in as                              | Commerce Manager                           |
| A store API key with a secret, able to read and write Custom API Entries                   | Saved list writes; an implicit token cannot do them | Commerce Manager → Application Keys        |

If any of these is missing, the example sends you to `/configuration-error`,
which names what is missing. It does not render an empty panel.

## Provisioning

The provisioning script creates the Custom API and its fields. It takes admin
credentials from your shell, and the storefront never holds them — they are not
in `.env.local` and not in any `NEXT_PUBLIC_` variable:

```bash
EP_ENDPOINT_URL=https://euwest.api.elasticpath.com \
EP_ADMIN_CLIENT_ID=your_admin_client_id \
EP_ADMIN_CLIENT_SECRET=your_admin_client_secret \
pnpm provision
```

Running it twice is safe. Anything that already exists is reported and left
alone.

The example looks the Custom API up by slug at startup, so provisioning hands
you no id to copy anywhere.

## Configuration

Copy `.env.example` to `.env.local` and fill it in:

```
NEXT_PUBLIC_EPCC_ENDPOINT_URL=https://euwest.api.elasticpath.com
NEXT_PUBLIC_EPCC_CLIENT_ID=your_client_id
NEXT_PUBLIC_PASSWORD_PROFILE_ID=your_password_profile_id
EPCC_CLIENT_ID=your_server_client_id
EPCC_CLIENT_SECRET=your_server_client_secret
SESSION_SECRET=a_random_string_of_at_least_32_characters
```

`EPCC_CLIENT_ID` and `EPCC_CLIENT_SECRET` are read only on the server, by
`src/lib/server-credentials.ts`. They have no `NEXT_PUBLIC_` prefix, so Next.js
will not put them in the client bundle, and the modules that read them import
`server-only`, which turns an accidental client import into a build error.

Use a different, lower-privileged key here than the admin key you provisioned
with: this one only needs to read and write Custom API Entries.

`SESSION_SECRET` signs the session cookie. Change it and every session is
invalidated, which is the point.

## Running it

```bash
pnpm install
pnpm provision   # with admin credentials in your shell, once per store
pnpm dev
```

Then:

1. Open <http://localhost:3000>. Signed out, you see products and no list.
2. Sign in as an account member.
3. Save a product, open **Saved list**, remove it again.
4. Sign in as a member of a different account. The list is empty — the entries
   are still there, and the store's API would happily return them, but this
   application will not.

## Why the settings endpoint

Custom API Entries are reachable two ways:

- `/v2/extensions/saved-list-items` — the slug endpoint, the one a storefront
  would normally use.
- `/v2/settings/extensions/custom-apis/{id}/entries` — the settings endpoint,
  meant for acting on Custom APIs generically, in an admin capacity.

This example uses the settings endpoint. All of its access is server-side and
already admin-capacity, doing its own authorization; and it is the endpoint
`@epcc-sdk/commerce-extensions` types a request body and a `filter` query for.
Both endpoints read and write the same records, so nothing about the
authorization changes if you switch.

## Tests

```bash
pnpm test
```

- `src/lib/saved-list.test.ts` — account scoping, deduplication, and the
  cross-account read and delete attempts.
- `src/lib/session.test.ts` — an edited or re-signed session cookie is rejected.
- `src/lib/store-requirements.test.ts` — missing configuration is named, not
  swallowed.
