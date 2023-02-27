import { Select } from "@chakra-ui/react";
import { useHitsPerPage } from "react-instantsearch-hooks-web";
import { HitsPerPageConnectorParams } from "instantsearch.js/es/connectors/hits-per-page/connectHitsPerPage";

export default function HitsPerPage(
  props: HitsPerPageConnectorParams
): JSX.Element {
  const { items, refine, hasNoResults } = useHitsPerPage(props);
  const { value } = items.find(({ isRefined }) => isRefined) || {};
  return (
    <Select
      onChange={(event) => refine(Number(event.target.value))}
      defaultValue={value}
      disabled={hasNoResults}
    >
      {items.map(({ value, label }) => (
        <option value={value} key={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}
