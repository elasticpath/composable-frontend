import {
  HStack,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Stack,
} from "@chakra-ui/react";
import { MinusIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { RangeRenderState } from "instantsearch.js/es/connectors/range/connectRange";

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
    <Stack spacing={4} my={4}>
      <HStack justify="space-evenly">
        <Input
          type="number"
          placeholder="Min"
          w="80px"
          value={inputValues[0]}
          readOnly
        />
        <MinusIcon />
        <Input
          type="number"
          placeholder="Max"
          w="80px"
          value={inputValues[1]}
          readOnly
        />
      </HStack>
      <RangeSlider
        isDisabled={!canRefine}
        aria-label={["min", "max"]}
        min={Number(range.min)}
        max={Number(range.max)}
        value={inputValues}
        onChange={(val) => {
          setInputValues(val);
        }}
        onChangeEnd={(val) => {
          const [minVal, maxVal] = val;
          if (minVal && maxVal) {
            refine([minVal, maxVal]);
          }
        }}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} backgroundColor="gray.200" />
        <RangeSliderThumb index={1} backgroundColor="gray.200" />
      </RangeSlider>
    </Stack>
  );
};

export default PriceRangeSlider;
