---
"@epcc-sdk/sdks-shopper": minor
---

Add the user authentication info update so an account member can change their own name or email. The request is a partial update: `type` is required, and `name` and `email` are optional. Updating email does not change the login username.
