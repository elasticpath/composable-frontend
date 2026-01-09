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
      className="slider-root relative flex items-center select-none touch-none pb-6"
      min={min}
      max={max}
      value={value}
      onValueChange={setValue}
      onValueCommit={refine as (value: number[]) => void}
      disabled={!canRefine}
    >
      <Slider.Track className="relative flex-grow h-1 bg-[#dfe2ee] rounded-full">
        <Slider.Range className="absolute h-full bg-[#3a4570]" />
      </Slider.Track>
      <Slider.Thumb
        aria-label="Minimum"
        className="relative block w-5 h-5 bg-white border border-[#c4c8d8] shadow-[0_2px_5px_0_#e3e5ec] rounded-full cursor-pointer"
      >
        <span className="absolute top-6 left-0 text-[0.8rem]">{value[0]}</span>
      </Slider.Thumb>
      <Slider.Thumb
        aria-label="Maximum"
        className="relative block w-5 h-5 bg-white border border-[#c4c8d8] shadow-[0_2px_5px_0_#e3e5ec] rounded-full cursor-pointer"
      >
        <span className="absolute top-6 right-0 text-[0.8rem]">{value[1]}</span>
      </Slider.Thumb>
    </Slider.Root>
  )
}
