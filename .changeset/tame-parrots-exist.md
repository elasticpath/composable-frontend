---
"@epcc-sdk/sdks-shopper": patch
---

enhance cart and order SDK specifications

- Created dedicated cart item object types (CustomItemCartObject, PromotionItemCartObject, SubscriptionItemCartObject) to properly type cart responses
- Added id property to CustomItemCartObject and PromotionItemCartObject for consistent identification
- Fixed CartIncluded.items array to reference the correct cart-specific object types instead of base data types
- Added include parameters to order endpoints (getCustomerOrders, getAnOrder) to allow fetching order items
- Added filtering, pagination, and sorting parameters to getCustomerOrders endpoint
- Created OrderIncluded and OrdersIncluded types to support order item responses
- Updated OrderEntityResponse and OrderCollectionResponse to include the new included property