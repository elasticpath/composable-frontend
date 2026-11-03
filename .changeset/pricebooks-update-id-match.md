---
"@epcc-sdk/sdks-pricebooks": patch
---

Say that the `data.id` of a price book, price or price modifier update must match the ID in the path; pricebooks.svc returns 409 when it does not.
