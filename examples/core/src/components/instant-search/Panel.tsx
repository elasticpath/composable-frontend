import type { ReactNode } from "react"
import {
  HierarchicalMenu,
  RefinementList,
  useHierarchicalMenu,
  useRange,
  useRefinementList,
  type HierarchicalMenuProps,
  type RefinementListProps,
  type UseRangeProps,
} from "react-instantsearch"
import { RangeSlider } from "./RangeSlider"

type PanelSlots = {
  header?: ReactNode
  footer?: ReactNode
}

function Panel({
  children,
  header,
  footer,
  empty,
}: React.PropsWithChildren<PanelSlots & { empty: boolean }>) {
  return (
    <div className={empty ? undefined : "ais-Panel mb-4"} hidden={empty}>
      {!empty && header && <div className="ais-Panel-header">{header}</div>}
      <div className="ais-Panel-body">{children}</div>
      {!empty && footer && <div className="ais-Panel-footer">{footer}</div>}
    </div>
  )
}

export function HierarchicalMenuPanel({
  header,
  footer,
  ...menu
}: HierarchicalMenuProps & PanelSlots) {
  const { canRefine } = useHierarchicalMenu(menu)

  return (
    <Panel header={header} footer={footer} empty={!canRefine}>
      <HierarchicalMenu {...menu} />
    </Panel>
  )
}

export function RefinementListPanel({
  header,
  footer,
  ...list
}: RefinementListProps & PanelSlots) {
  const { canRefine } = useRefinementList(list)

  return (
    <Panel header={header} footer={footer} empty={!canRefine}>
      <RefinementList {...list} />
    </Panel>
  )
}

export function RangeSliderPanel({
  header,
  footer,
  ...range
}: UseRangeProps & PanelSlots) {
  const { canRefine, start } = useRange(range)
  const refined = start.some(Number.isFinite)

  return (
    <Panel header={header} footer={footer} empty={!canRefine && !refined}>
      <RangeSlider {...range} />
    </Panel>
  )
}
