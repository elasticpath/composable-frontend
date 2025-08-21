import "./RangeSlider.css"
import { useState, useEffect } from "react"
import * as Slider from "@radix-ui/react-slider"
import { useRange, UseRangeProps } from "react-instantsearch"

export function RangeSlider(props: UseRangeProps) {
  const { start, range, canRefine, refine } = useRange(props)
  const { min, max } = range
  const [value, setValue] = useState([min!, max!])

  const from = Math.max(min!, Number.isFinite(start[0]!) ? start[0]! : min!)
  const to = Math.min(max!, Number.isFinite(start[1]!) ? start[1]! : max!)

  useEffect(() => {
    setValue([from, to])
  }, [from, to])

  return (
    <Slider.Root
      className="slider-root"
      min={min}
      max={max}
      value={value}
      onValueChange={setValue}
      onValueCommit={refine as (value: number[]) => void}
      disabled={!canRefine}
    >
      <Slider.Track className="slider-track">
        <Slider.Range className="slider-range" />
      </Slider.Track>
      <Slider.Thumb className="slider-thumb" />
      <Slider.Thumb className="slider-thumb" />
    </Slider.Root>
  )
}
