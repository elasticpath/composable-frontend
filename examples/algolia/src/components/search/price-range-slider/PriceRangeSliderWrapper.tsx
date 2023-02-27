import type {
  RangeConnectorParams,
  RangeWidgetDescription,
} from "instantsearch.js/es/connectors/range/connectRange";
import connectRange from "instantsearch.js/es/connectors/range/connectRange";
import { useConnector } from "react-instantsearch-hooks-web";
import PriceRangeSliderComponent from "./PriceRangeSlider";
import { Heading } from "@chakra-ui/react";

export type UseRangeSliderProps = RangeConnectorParams;

export default function PriceRangeSliderWrapper(
  props: UseRangeSliderProps
): JSX.Element {
  const useRangeSlider = (props?: UseRangeSliderProps) => {
    return useConnector<RangeConnectorParams, RangeWidgetDescription>(
      connectRange,
      props
    );
  };

  const data = useRangeSlider(props);
  if (!data.range.max) return <></>;

  return (
    <>
      <Heading as="h3" size="sm" mt={5} pb={1}>
        Price
      </Heading>
      <PriceRangeSliderComponent {...data} />
    </>
  );
}
