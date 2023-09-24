import CustomFormControl from "./CustomFormControl";
import CountrySelect from "./CountrySelect";

export default function ShippingForm(): JSX.Element {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-[1fr_1fr]">
        <CustomFormControl
          id="first_name"
          type="text"
          name="shippingAddress.first_name"
          autoComplete="shipping given-name"
          label="First Name"
          aria-label="First Name"
          isRequired={true}
        />
        <CustomFormControl
          id="last_name"
          type="text"
          name="shippingAddress.last_name"
          autoComplete="shipping family-name"
          label="Last Name"
          aria-label="Last Name"
          isRequired={true}
        />
      </div>
      <CustomFormControl
        id="line_1"
        type="text"
        name="shippingAddress.line_1"
        autoComplete="shipping address-line-1"
        label="Street Address"
        aria-label="Street Address"
        isRequired={true}
      />
      <CustomFormControl
        id="line_2"
        type="text"
        name="shippingAddress.line_2"
        autoComplete="shipping address-line-2"
        label="Extended Address"
        aria-label="Extended Address"
      />
      <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-[1fr_1fr]">
        <CustomFormControl
          id="city"
          type="text"
          name="shippingAddress.city"
          autoComplete="shipping city"
          label="City"
          aria-label="City"
        />
        <CustomFormControl
          id="county"
          type="text"
          name="shippingAddress.county"
          autoComplete="shipping county"
          label="County"
          aria-label="County"
        />
      </div>
      <CustomFormControl
        id="region"
        type="text"
        name="shippingAddress.region"
        autoComplete="shipping region"
        label="Region"
        aria-label="Region"
        isRequired={true}
      />
      <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-[1fr_1fr]">
        <CustomFormControl
          id="postcode"
          type="text"
          name="shippingAddress.postcode"
          autoComplete="shipping postcode"
          label="Postcode"
          aria-label="Postcode"
          isRequired={true}
        />
        <CountrySelect
          id="country"
          name="shippingAddress.country"
          autoComplete="shipping country"
          label="Country"
          placeholder="select country"
          aria-label="Country"
          isRequired={true}
        />
      </div>
      <CustomFormControl
        id="phone_number"
        type="text"
        name="shippingAddress.phone_number"
        autoComplete="tel"
        aria-label="Phone Number"
        label="Phone Number"
      />
      <CustomFormControl
        id="instructions"
        autoComplete="shippingAddress instructions"
        type="text"
        name="shippingAddress.instructions"
        label="Additional Instructions"
        aria-label="Additional Instructions"
      />
    </div>
  );
}
