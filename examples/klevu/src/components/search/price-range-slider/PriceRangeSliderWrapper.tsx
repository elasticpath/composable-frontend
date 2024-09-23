import PriceRangeSliderComponent, { PriceRange } from "./PriceRangeSlider";

export default function PriceRangeSliderWrapper(): JSX.Element {
  return (
    <>
      <h3 className="mt-5 pb-1 font-semibold">Price</h3>
      <PriceRangeSliderComponent />
    </>
  );
}
