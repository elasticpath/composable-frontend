---
"@epcc-sdk/sdks-shopper": minor
---

`FeaturePlanConfigurationUpdate`, `NullablePaymentAuthority` and `NullablePaymentAuthorityWritable` now include `null`, as the API and the `./zod` schemas already did. An offering plan update can send `null` for a feature configuration to remove it, and a subscriber update can send `payment_authority: null` to clear it.
