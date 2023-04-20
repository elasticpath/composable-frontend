import { Grid } from "@chakra-ui/react";
import CustomFormControl from "./CustomFormControl";
import CountrySelect from "./CountrySelect";

export default function BillingForm(): JSX.Element {
  return (
    <Grid gap={4}>
      <Grid gap={4} gridTemplateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}>
        <CustomFormControl
          id="first_name"
          type="text"
          name="billingAddress.first_name"
          autoComplete="billing given-name"
          label="First Name"
          isRequired={true}
          aria-label="First Name"
        />
        <CustomFormControl
          id="last_name"
          type="text"
          name="billingAddress.last_name"
          autoComplete="billing family-name"
          label="Last Name"
          aria-label="Last Name"
          isRequired={true}
        />
      </Grid>
      <CustomFormControl
        id="line_1"
        type="text"
        name="billingAddress.line_1"
        autoComplete="billing address-line-1"
        label="Street Address"
        aria-label="Street Address"
        isRequired={true}
      />
      <CustomFormControl
        id="line_2"
        type="text"
        name="billingAddress.line_2"
        autoComplete="billing address-line-2"
        aria-label="Extended Address"
        label="Extended Address"
      />
      <Grid gap={4} gridTemplateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}>
        <CustomFormControl
          id="city"
          type="text"
          name="billingAddress.city"
          autoComplete="billing city"
          label="City"
          aria-label="City"
        />
        <CustomFormControl
          id="county"
          type="text"
          name="billingAddress.county"
          autoComplete="billing county"
          label="County"
          aria-label="County"
        />
      </Grid>
      <CustomFormControl
        id="region"
        type="text"
        name="billingAddress.region"
        autoComplete="billing region"
        label="Region"
        aria-label="Region"
        isRequired={true}
      />
      <Grid gap={4} gridTemplateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}>
        <CustomFormControl
          id="postcode"
          type="text"
          name="billingAddress.postcode"
          autoComplete="billing postcode"
          label="Postcode"
          aria-label="Postcode"
          isRequired={true}
        />
        <CountrySelect
          id="country"
          name="billingAddress.country"
          autoComplete="billing country"
          label="Country"
          aria-label="Country"
          placeholder="select country"
          isRequired={true}
        />
      </Grid>
    </Grid>
  );
}
