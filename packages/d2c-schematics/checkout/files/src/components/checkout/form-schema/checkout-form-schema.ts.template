import { z } from "zod";

const personalInformationSchema = z.object({
  email: z.string({ required_error: "Required" }).email("Invalid email"),
});

const billingAddressSchema = z.object({
  first_name: z
    .string({ required_error: "You need to provided a first name." })
    .min(2),
  last_name: z
    .string({ required_error: "You need to provided a last name." })
    .min(2),
  company_name: z.string().min(1).optional(),
  line_1: z
    .string({ required_error: "You need to provided an address." })
    .min(1),
  line_2: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  county: z.string().min(1).optional(),
  region: z.string({ required_error: "You need to provided a region." }).min(1),
  postcode: z
    .string({ required_error: "You need to provided a postcode." })
    .min(1),
  country: z
    .string({ required_error: "You need to provided a country." })
    .min(1),
});

const shippingAddressSchema = z
  .object({
    phone_number: z
      .string()
      .regex(
        /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
        "Phone number is not valid",
      )
      .optional(),
    instructions: z.string().min(1).optional(),
  })
  .merge(billingAddressSchema);

export const checkoutFormSchema = z.object({
  personal: personalInformationSchema,
  shippingAddress: shippingAddressSchema,
  sameAsShipping: z.boolean().default(true),
  billingAddress: billingAddressSchema.optional(),
});

export type CheckoutForm = z.TypeOf<typeof checkoutFormSchema>;
