import { Heading, FormControl, FormLabel, Switch } from "@chakra-ui/react";
import { useToggleRefinement } from "react-instantsearch-hooks-web";

const OnSaleRefinement = ({ attribute }: { attribute: string }) => {
  const { value, refine } = useToggleRefinement({ attribute });

  return (
    <>
      <Heading as="h3" size="sm" mt={5} pb={1}>
        Sale
      </Heading>
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="email-alerts" mb="0">
          On sale products
        </FormLabel>
        <Switch
          isChecked={value.isRefined}
          onChange={(e) => refine({ isRefined: !e.target.checked })}
        />
      </FormControl>
    </>
  );
};

export default OnSaleRefinement;
