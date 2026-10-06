import { useInstantSearch } from "react-instantsearch"

type RefinementWidget =
  | { type: "hierarchicalMenu"; attributes: string[] }
  | { type: "refinementList"; attribute: string }
  | { type: "range"; attribute: string }

type IndexRenderState = ReturnType<typeof useInstantSearch>["indexRenderState"]

function widgetHasNothingToRefine(
  renderState: IndexRenderState,
  widget: RefinementWidget,
): boolean {
  switch (widget.type) {
    case "hierarchicalMenu":
      return (
        renderState.hierarchicalMenu?.[widget.attributes[0]!]?.canRefine ===
        false
      )
    case "refinementList":
      return (
        renderState.refinementList?.[widget.attribute]?.canRefine === false
      )
    case "range":
      return renderState.range?.[widget.attribute]?.canRefine === false
  }
}

export function Panel({
  children,
  header,
  footer,
  widget,
}: React.PropsWithChildren<{
  header?: React.ReactNode
  footer?: React.ReactNode
  widget?: RefinementWidget
}>) {
  const { indexRenderState } = useInstantSearch()
  const hidden = widget && widgetHasNothingToRefine(indexRenderState, widget)

  return (
    <div className="ais-Panel mb-4" hidden={hidden}>
      {header && <div className="ais-Panel-header">{header}</div>}
      <div className="ais-Panel-body">{children}</div>
      {footer && <div className="ais-Panel-footer">{footer}</div>}
    </div>
  )
}
