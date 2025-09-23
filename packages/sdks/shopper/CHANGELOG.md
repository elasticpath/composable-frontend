# @epcc-sdk/sdks-shopper

## 0.0.42

### Patch Changes

- ee7e9c7: update readme.md

## 0.0.41

### Patch Changes

- 018ec4f: - Shopper SDK support for catalog search
  - Instant search support for catalog search

## 0.0.40

### Patch Changes

- 4e4ef25: - paypal express property support
  - support overriding authorization header

## 0.0.39

### Patch Changes

- a828195: enhance cart and order SDK specifications

  - Created dedicated cart item object types (CustomItemCartObject, PromotionItemCartObject, SubscriptionItemCartObject) to properly type cart responses
  - Added id property to CustomItemCartObject and PromotionItemCartObject for consistent identification
  - Fixed CartIncluded.items array to reference the correct cart-specific object types instead of base data types
  - Added include parameters to order endpoints (getCustomerOrders, getAnOrder) to allow fetching order items
  - Added filtering, pagination, and sorting parameters to getCustomerOrders endpoint
  - Created OrderIncluded and OrdersIncluded types to support order item responses
  - Updated OrderEntityResponse and OrderCollectionResponse to include the new included property

## 0.0.38

### Patch Changes

- e631d62: readme update

## 0.0.37

### Patch Changes

- 1e4289d: Added built in authentication helper

## 0.0.36

### Patch Changes

- 26416fd: fix types for cart items sdk shopper

## 0.0.35

### Patch Changes

- 3fcfd0e: Expose subs state endpoint to shopper sdk

## 0.0.34

### Patch Changes

- 60f1e9c: Updated cart sdk to match latest spec

## 0.0.33

### Patch Changes

- 9344e1d: Update shopper sdk to reflect subs changes

## 0.0.32

### Patch Changes

- 46a6aa8: Fix React Query optional dependency issue by separating exports into `/react-query` subpath. Non-React users can now use the SDK without installing @tanstack/react-query.

## 0.0.31

### Patch Changes

- ced70c5: Update the catalog view spec to the latest adding missing sdk params

## 0.0.30

### Patch Changes

- 1242005: Add a storage key option so getCartId can support multiple carts

## 0.0.29

### Patch Changes

- 96dfb36: Added built in interceptor for local storage auth lifecycle

## 0.0.28

### Patch Changes

- 3d4b77a: Add one time password token request operation to shopper sdk
- 3d4b77a: add ability to update account password from shopper sdk

## 0.0.27

### Patch Changes

- 8cd7dad: Support esm modules correctly

## 0.0.26

### Patch Changes

- 742ed52: add relevant subscriber endpoints to shopper

## 0.0.25

### Patch Changes

- 09d3a57: add missing cart properties

## 0.0.24

### Patch Changes

- 1a19c39: Add include to get an order operation
- a4adea2: add customer details to order response

## 0.0.23

### Patch Changes

- 1e94fe3: add include for cart checkout get orders

## 0.0.22

### Patch Changes

- d3d3c11: Update to match latest specs

## 0.0.21

### Patch Changes

- 0733828: nest display price properties correctly on order meta

## 0.0.20

### Patch Changes

- c188d95: Add files to shopper

## 0.0.19

### Patch Changes

- f572a2c: add currencies to shopper

## 0.0.18

### Patch Changes

- 6a5a1bd: add post account to shopper sdk
- 591d298: add account put for shopper

## 0.0.17

### Patch Changes

- 2c3e2ab: Make sure post requests to add address are to the correct endpoint

## 0.0.16

### Patch Changes

- a1e36ba: Add missing name property on cart item promotion type

## 0.0.15

### Patch Changes

- 962ba3a: Add extract media utility
- 5084ff0: Add accounts and account addresses to shopper
- 2721de3: Add included to get by context products for node
- 962ba3a: Correct types cart item response remove extra data wrapper

## 0.0.14

### Patch Changes

- 4e26768: response body for create access token operation
- 0a33450: create body for cart should be wrapped with data

## 0.0.13

### Patch Changes

- 00eeb7d: use correct cart items response type

## 0.0.12

### Patch Changes

- e70e40c: Add correct cart items to inlcude type

## 0.0.11

### Patch Changes

- b185918: Add authentication to shopper

## 0.0.10

### Patch Changes

- ee7b633: add include to all products

## 0.0.9

### Patch Changes

- 1c3586d: Remove version from README

## 0.0.8

### Patch Changes

- 6324423: Fix include types
- 6324423: Add README sdks

## 0.0.7

### Patch Changes

- c05230a: Correct paths on get cart operation

## 0.0.6

### Patch Changes

- f619f39: Add included for cart items to the shopper sdk

## 0.0.5

### Patch Changes

- d11627f: Add inventories to shopper sdk

## 0.0.4

### Patch Changes

- 4a951d5: Add subscriptions service to the shopper sdk

## 0.0.3

### Patch Changes

- 4d38c73: Latest sdk now inlcudes add subscription to cart

## 0.0.2

### Patch Changes

- 0496e87: init release of next gen sdks
