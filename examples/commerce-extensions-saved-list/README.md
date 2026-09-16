# Account-scoped custom data on Commerce Extensions

A signed-in shopper saves products to a list. The list is only the demo. The example teaches how to store custom data that belongs to one account. It also teaches how to stop one shopper from reading or changing another shopper's data.

## The problem this example solves

Commerce Extensions lets you create a Custom API, which is a table you define yourself. Each saved product becomes one Custom API Entry, which is one record in that table. Every entry holds two fields: the id of the account that owns it, and the id of the saved product.

Two facts about the platform shape the whole example.

First, a Custom API Entry has no owner. A caller that can list entries gets every shopper's entries. A caller that can delete by id can delete any entry, whoever saved it. The `account_id` field is an ordinary string that you write and you check.

Second, an implicit token cannot write. An implicit token is the read-only token a storefront uses in the browser. It cannot create, update or delete a Custom API Entry, so every write must go through your own server.

## Does Elastic Path secure this for you?

No. The one native control is a [Custom API Role Policy](https://developer.elasticpath.com/docs/api/permissions/custom-api-role-policies). It grants a role Create, List, Read, Update or Delete on a whole Custom API.

That control works per role and per API, not per entry. A role that holds List receives every shopper's entries. A role that holds Delete can remove any of them. No configuration narrows an entry to the account that created it, so your application must do it.

## How the example secures it

The account id must be a value the browser cannot choose. Three files decide this, in the order a request passes through them.

`src/lib/session.ts` decides who is asking. The session cookie is `httpOnly`, so page scripts cannot read it, and it carries a signature made with a server-only secret. The account id inside it is written once, at sign-in, from the response Elastic Path returns. If a shopper edits the account id, the signature no longer matches and the request returns 401.

`src/lib/saved-list-context.ts` turns that session into an account id and a store handle. Every route starts here, so no route can reach the data without a session.

`src/lib/saved-list.ts` performs every read and write, and keeps four rules:

1. The account id comes from the session. It is a required argument, so no code path can omit it. A request body can name only a product.
2. Reads are scoped twice. The filter `eq(account_id,<id>)` goes to the API, and the result is filtered again in memory. If the field is provisioned wrong and the API returns the whole table, the second check still returns an empty list.
3. A delete re-reads the entry and compares the owner first. Another shopper's entry returns 404, the same answer a missing entry returns, so the route cannot tell a caller which entry ids are real.
4. An account id must match `[A-Za-z0-9_-]` before it enters a filter string. Elastic Path does not escape filter values. A value that contains `,` or `)` changes the shape of the query instead of being compared by it.

Two more guards sit outside that file. The key that performs writes holds a secret, so it stays on the server. It carries no `NEXT_PUBLIC_` prefix. The modules that read it import `server-only`, so an accidental client import becomes a build failure. The session cookie uses `sameSite: lax`, so another site cannot drive these routes with the shopper's session.

## What this example does not do

Read this before you copy the pattern.

- It does not scope the storefront key. A write needs a key with a secret. An Elastic Path store key is not scoped per endpoint, so the key the storefront holds can do more than the saved list needs. The guarantee is narrower. The secret never reaches the browser, and the credentials that create the Custom API never sit in a file the application loads. In production, put the writes behind a service you control.
- It does not handle guest shoppers. A guest list lives in browser storage, and merging one into an account at sign-in is a separate problem.

## Store Setup Requirements

The store must hold the following before the example runs.

| Requirement                                                                                    | Why                                                       | How to get it                                     |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| A Custom API with slug `saved-list-items`, holding `account_id` and `product_id` string fields | Where saved entries live                                  | Run `pnpm provision`, below                       |
| A published catalog with at least one product                                                  | The products a shopper can save                           | Publish a catalog in Commerce Manager             |
| A password profile on an authentication realm                                                  | Shoppers sign in with an email address and a password     | Commerce Manager, then copy the id of the profile |
| An account with at least one account member                                                    | Somebody to sign in as                                    | Commerce Manager                                  |
| A store API key with a secret that can read and write Custom API Entries                       | Saved list writes, which an implicit token cannot perform | Commerce Manager, Application Keys                |

The example checks the environment variables and the shape of the endpoint URL when it starts. If one of those is wrong, it sends you to `/configuration-error`, which names what is wrong. It also names the Custom API when the store does not hold one.

The example cannot check the other rows before you use them. A missing password profile appears as a failed sign-in. A key without permission on Custom API Entries appears as a failed saved list request.

## Provisioning

The provisioning script creates the Custom API and its fields. Give it admin credentials in your shell. Do not put them in a file the application loads:

```bash
EP_ENDPOINT_URL=https://euwest.api.elasticpath.com \
EP_ADMIN_CLIENT_ID=your_admin_client_id \
EP_ADMIN_CLIENT_SECRET=your_admin_client_secret \
pnpm provision
```

You can run it twice. It reports anything that already exists and leaves it alone. The example finds the Custom API by slug when it starts, so provisioning gives you no id to copy.

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

Set `NEXT_PUBLIC_EPCC_ENDPOINT_URL` to an absolute URL that includes the scheme. A bare host name fails on the first request.

`SESSION_SECRET` signs the session cookie. If you change it, every session becomes invalid.

## Running it

```bash
pnpm install
pnpm provision   # once per store, with admin credentials in your shell
pnpm dev
```

Then follow these steps:

1. Open <http://localhost:3000>. Signed out, you see products and no list.
2. Sign in as an account member.
3. Save a product, open the saved list, and remove the product again.
4. Sign in as a member of a different account. The list is empty. The entries still exist, and the store API returns them to a caller that asks without scoping, but this application does not.

## Why the settings endpoint

You can reach Custom API Entries two ways:

- `/v2/extensions/saved-list-items`, the slug endpoint, which a storefront normally uses.
- `/v2/settings/extensions/custom-apis/{id}/entries`, the settings endpoint, for working with Custom APIs in an admin capacity.

The example uses the settings endpoint for one reason. In `@epcc-sdk/commerce-extensions`, only that pair of operations carries a typed request body and a typed `filter` query. This is an SDK fact, not a security one.

Both endpoints take the same bearer token and hold the same records. If you move to the slug endpoint, only `src/lib/commerce-extensions-store.ts` changes.

## Tests

```bash
pnpm test
```

- `src/app/api/saved-list/routes.test.ts` runs the acceptance criteria through the real route handlers. One shopper never sees another shopper's entries, a delete of another shopper's entry id returns 404, and a signed-out visitor gets 401 with no write.
- `src/lib/saved-list.test.ts` covers the ownership rules, including the case where the API ignores the filter and returns the whole table.
- `src/lib/session.test.ts` covers an edited or re-signed session cookie.
- `src/lib/store-requirements.test.ts` covers configuration that is missing or unusable.
