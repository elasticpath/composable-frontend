import { MinusIcon } from "@chakra-ui/icons";
import {
  Heading,
  HStack,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Stack,
} from "@chakra-ui/react";
import type {
  RangeConnectorParams,
  RangeWidgetDescription,
} from "instantsearch.js/es/connectors/range/connectRange";
import connectRange from "instantsearch.js/es/connectors/range/connectRange";
import { useConnector } from "react-instantsearch-hooks-web";

export type UseRangeSliderProps = RangeConnectorParams;

export default function PriceRangeSlider(
  props: UseRangeSliderProps
): JSX.Element {
  const useRangeSlider = (props?: UseRangeSliderProps) => {
    return useConnector<RangeConnectorParams, RangeWidgetDescription>(
      connectRange,
      props
    );
  };

  const { start, range, refine, canRefine } = useRangeSlider(props);

  const [min, max] = start;

  return (
    <Stack spacing={4} my={4}>
      <Heading as="h4" size="md">
        Price
      </Heading>
      <HStack justify="space-evenly">
        <Input
          type="number"
          placeholder="Min"
          w="80px"
          value={min && isFinite(min) ? min : ""}
          readOnly
        />
        <MinusIcon />
        <Input
          type="number"
          placeholder="Max"
          w="80px"
          value={max && isFinite(max) ? max : ""}
          readOnly
        />
      </HStack>
      <RangeSlider
        isDisabled={!canRefine}
        aria-label={["min", "max"]}
        min={Number(range.min)}
        max={Number(range.max)}
        defaultValue={[Number(range.min), Number(range.max)]}
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
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>
    </Stack>
  );
}
