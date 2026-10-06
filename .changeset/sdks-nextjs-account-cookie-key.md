---
"@epcc-sdk/sdks-nextjs": patch
---

`isAccountAuthenticated` takes an optional cookie name, so a storefront that sets its own cookie prefix can check for its account member cookie. With no argument it still reads `_store_ep_account_member_token`.
