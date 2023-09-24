import { MinusIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { RangeRenderState } from "instantsearch.js/es/connectors/range/connectRange";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface ISlider extends RangeRenderState {}

const PriceRangeSlider = ({ refine, canRefine, range }: ISlider) => {
  const [inputValues, setInputValues] = useState<number[]>([
    range.min as number,
    range.max as number,
  ]);

  useEffect(() => {
    setInputValues([range.min as number, range.max as number]);
  }, [range.min, range.max]);

  return (
    <div className="my-4 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-evenly gap-4">
        <input
          type="number"
          className="flex w-[5rem] flex-grow rounded-md border px-4 py-2"
          placeholder="Min"
          value={inputValues[0]}
          readOnly
        />
        <MinusIcon width={24} height={24} />
        <input
          type="number"
          className="flex w-[5rem] flex-grow rounded-md border px-4 py-2"
          placeholder="Max"
          value={inputValues[1]}
          readOnly
        />
      </div>

      <Slider
        disabled={!canRefine}
        range={true}
        min={Number(range.min)}
        max={Number(range.max)}
        value={inputValues}
        onChange={(val) => {
          if (typeof val === "number") {
            setInputValues([val]);
          } else {
            const [minVal, maxVal] = val;
            setInputValues(val);
            refine([minVal, maxVal]);
          }
        }}
      />
    </div>
  );
};

export default PriceRangeSlider;
