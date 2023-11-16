import CustomFormControl from "./CustomFormControl";
import CountrySelect from "./CountrySelect";

export default function BillingForm(): JSX.Element {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-2">
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
      </div>
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
      <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-2">
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
      </div>
      <CustomFormControl
        id="region"
        type="text"
        name="billingAddress.region"
        autoComplete="billing region"
        label="Region"
        aria-label="Region"
        isRequired={true}
      />
      <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-2">
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
      </div>
    </div>
  );
}
