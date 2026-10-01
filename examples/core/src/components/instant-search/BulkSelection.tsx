"use client"

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react"
import { useInstantSearch } from "react-instantsearch"
import { useQueryClient } from "@tanstack/react-query"
import { getACartQueryKey } from "@epcc-sdk/sdks-shopper/react-query"
import { getCookie } from "cookies-next/client"
import { addSelectedToCartAction } from "src/app/[lang]/(store)/products/[...productSegment]/actions/cart-actions"
import { useNotify } from "src/hooks/use-event"
import { CART_COOKIE_NAME } from "src/lib/cookie-constants"
import {
  bulkSelectionReducer,
  canAddSelection,
  emptyBulkSelection,
  isCardSelected,
  selectedProductIds,
  selectedProducts,
  type BulkSelection,
  type BulkSelectionAction,
  type SelectableCard,
} from "src/lib/bulk-selection"
import {
  describeBulkAddFailure,
  QUANTITY_PER_SELECTED_PRODUCT,
  type BulkAddFailure,
} from "src/lib/bulk-add-to-cart"
import { Button } from "../button/Button"

type BulkSelectionContextValue = {
  state: BulkSelection
  resultsKey: string
  dispatch: Dispatch<BulkSelectionAction>
}

const BulkSelectionContext = createContext<BulkSelectionContextValue | null>(
  null,
)

function useBulkSelection() {
  const context = useContext(BulkSelectionContext)
  if (!context) {
    throw new Error("useBulkSelection must be used within a BulkSelectionProvider")
  }
  return context
}

export function BulkSelectionProvider({ children }: { children: ReactNode }) {
  const { indexUiState } = useInstantSearch()
  const resultsKey = JSON.stringify(indexUiState)
  const [state, dispatch] = useReducer(bulkSelectionReducer, emptyBulkSelection)

  useEffect(() => {
    dispatch({ type: "resultsChanged", resultsKey })
  }, [resultsKey])

  return (
    <BulkSelectionContext.Provider value={{ state, resultsKey, dispatch }}>
      {children}
    </BulkSelectionContext.Provider>
  )
}

export function BulkSelectCheckbox({
  cardId,
  productName,
  selectable,
}: {
  cardId: string
  productName?: string
  selectable: SelectableCard
}) {
  const { state, resultsKey, dispatch } = useBulkSelection()
  const checked = isCardSelected(state, resultsKey, cardId)
  const selectedProductId = selectable.selectable
    ? selectable.productId
    : undefined

  useEffect(() => {
    dispatch({ type: "productChanged", cardId, productId: selectedProductId })
  }, [dispatch, cardId, selectedProductId])

  const inputId = `bulk-select-${cardId}`
  const reasonId = `${inputId}-reason`

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
      <input
        id={inputId}
        type="checkbox"
        className="h-4 w-4 accent-black disabled:cursor-not-allowed"
        checked={checked}
        disabled={!selectable.selectable}
        aria-describedby={selectable.selectable ? undefined : reasonId}
        onChange={() => {
          if (!selectable.selectable) return
          dispatch({
            type: "toggle",
            resultsKey,
            cardId,
            productId: selectable.productId,
            productName,
          })
        }}
      />
      <label
        htmlFor={inputId}
        className={selectable.selectable ? "cursor-pointer" : "text-gray-400"}
      >
        Select
        <span className="sr-only"> {productName}</span>
      </label>
      {!selectable.selectable && (
        <span id={reasonId} className="text-xs text-gray-500">
          {selectable.reason}
        </span>
      )}
    </div>
  )
}

export function BulkAddBar({ currencyCode }: { currencyCode?: string }) {
  const { state, resultsKey, dispatch } = useBulkSelection()
  const notify = useNotify()
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [failure, setFailure] = useState<BulkAddFailure>()

  const products = selectedProducts(state, resultsKey)
  const productIds = selectedProductIds(state, resultsKey)
  const enabled = canAddSelection({ productIds, isAdding })

  useEffect(() => {
    setFailure(undefined)
  }, [resultsKey])

  async function addSelected() {
    setIsAdding(true)
    setFailure(undefined)
    try {
      const result = await addSelectedToCartAction(productIds, currencyCode)
      if (result.error) {
        setFailure(describeBulkAddFailure({ error: result.error, products }))
      } else {
        dispatch({
          type: "added",
          cardIds: products.map(({ cardId }) => cardId),
        })
        notify({
          scope: "cart",
          type: "success",
          action: "add-product",
          message: `Added ${productIds.length} ${productIds.length === 1 ? "product" : "products"} to your cart`,
        })
      }
    } catch {
      setFailure(describeBulkAddFailure({ error: undefined, products }))
    } finally {
      setIsAdding(false)
      const cartID = getCookie(CART_COOKIE_NAME)!
      await queryClient.invalidateQueries({
        queryKey: getACartQueryKey({
          path: { cartID },
          query: { include: ["items"] },
        }),
      })
    }
  }

  return (
    <section
      aria-label="Add selected products to cart"
      className="sticky bottom-0 z-10 mt-4 grid gap-2 rounded-md border border-gray-200 bg-white p-4 shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium" aria-live="polite">
          {productIds.length} selected
        </p>
        <Button
          type="button"
          size="medium"
          disabled={!enabled}
          onClick={addSelected}
        >
          {isAdding ? "Adding…" : "Add selected to cart"}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Adds {QUANTITY_PER_SELECTED_PRODUCT} of each, all together or not at
        all. Changing page, search, filters or sort clears the selection.
      </p>
      {failure && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <p className="font-medium">{failure.summary}</p>
          {failure.problems.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {failure.problems.map((problem, index) => (
                <li key={index}>{problem}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
