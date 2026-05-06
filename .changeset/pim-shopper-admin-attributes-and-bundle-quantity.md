---
"@epcc-sdk/sdks-pxm": minor
---

Add support for shopper and admin attributes, bundle quantity configuration, and selective column export on products.

- New `ShopperAttributes` and `AdminAttributes` types (string→string maps, max 100 keys) on products, hierarchies and nodes. `shopper_attributes` are catalog-visible; `admin_attributes` are admin-only.
- Product list/export endpoints now accept filters using `eq(shopper_attributes.<key>,…)` and `eq(admin_attributes.<key>,…)`.
- Product import (CSV) supports `shopper_attributes.<key>` / `admin_attributes.<key>` columns, partial updates, and the `__REMOVE_ATTRIBUTE__` sentinel for deleting a key.
- Product export request body supports `data.attributes.columns.include` to cherry-pick exported columns (including wildcards like `admin_attributes.*`).
- Bundle component options now expose per-option `min` / `max` to configure shopper-selectable quantities.
- Multi-product responses now include a `links` object (typed via the new `multi_links` schema).
