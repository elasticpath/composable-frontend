import type { Hit as AlgoliaHit } from "instantsearch.js/es/types"

import { Snippet } from "react-instantsearch"

type HitProps = {
  hit: AlgoliaHit<{
    attributes: {
      name: string
      description?: string
      sku: string
      extensions: {
        "products(Details)": {
          "BRAND-NAME": string
        }
      }
    }
    meta: {
      display_price: {
        with_tax: {
          formatted: string
        }
      }
    }
  }>
}

export function Hit({ hit }: HitProps) {
  return (
    <article className="hit">
      <div className="hit-image">
        <img src="https://placehold.co/400" alt={hit.attributes.name} />
      </div>
      <div>
        <h1>
          <Snippet hit={hit} attribute="attributes.name" />
        </h1>
        <div>
          By{" "}
          <strong>
            {hit.attributes.extensions?.["products(Details)"]?.["BRAND-NAME"]}
          </strong>{" "}
          {/*in <strong>{hit.categories[0]}</strong>*/}
          <span>{hit.meta.display_price.with_tax.formatted}</span>
        </div>
      </div>
    </article>
  )
}
