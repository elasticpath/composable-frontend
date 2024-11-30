import { MinusIcon } from "@heroicons/react/24/solid";
import { useCallback, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useSettings } from "../ProductsProvider";
import throttle from "lodash/throttle";

export type PriceRange = [number, number];

export const DEFAULT_MIN_VAL = 0;
export const DEFAULT_MAX_VAL = 300;

type PriceRangeSetting = {
  priceRange: number[], 
  setPriceRange: (value: number | number[]) => void
}

const PriceRangeSlider = () => {
  const {priceRange, setPriceRange} = useSettings('priceRange') as PriceRangeSetting;
  const [range, setRange] = useState(priceRange);

  const throttledSetPriceRange = useCallback(
    throttle((minVal: number, maxVal: number) => {
      setPriceRange([minVal, maxVal]);
    }, 1000),
    []
  );

  const handleSliderChange = (val: number[], updatePriceRange?: boolean) => {
    const [minVal, maxVal] = val;
    setRange([minVal, maxVal]);

    if(updatePriceRange) {
      throttledSetPriceRange(minVal, maxVal);
    }
  };

  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-evenly gap-4">
        <input
          type="number"
          className="flex w-[5rem] flex-grow rounded-md border px-4 py-2"
          placeholder="Min"
          value={range[0]}
          onChange={(e) => handleSliderChange([Number(e.target.value), range[1]], true)}
        />
        <MinusIcon width={24} height={24} />
        <input
          type="number"
          className="flex w-[5rem] flex-grow rounded-md border px-4 py-2"
          placeholder="Max"
          value={range[1]}
          onChange={(e) => handleSliderChange([range[0], Number(e.target.value)], true)}
        />
      </div>

      <Slider
        range={true}
        min={DEFAULT_MIN_VAL}
        max={DEFAULT_MAX_VAL}
        value={range}
        onChange={(val) => { handleSliderChange(val as number[])}}
        onChangeComplete={(val) => throttledSetPriceRange((val as number[])[0], (val as number[])[1])}
      />
    </div>
  );
};

export default PriceRangeSlider;
