import type { ComponentProductOption, Product } from "@epcc-sdk/sdks-shopper"

/**
 * The options a shopper can actually choose.
 *
 * A bundle's components name their options by product id, but the catalog returns
 * `included.component_products` for only the products published into the shopper's
 * catalog. An option naming a product that is not published therefore has no product
 * to render — no name, no price, no image — and cannot be bought, so it is not
 * offered. The same bundle can offer more options to a different shopper.
 */
export function selectAvailableOptions(
  options: ComponentProductOption[],
  componentProducts: Product[],
): ComponentProductOption[] {
  return options.filter((option) =>
    componentProducts.some((product) => product.id === option.id),
  )
}
