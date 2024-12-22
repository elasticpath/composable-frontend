import { z } from "zod";

/**
 * Validating optional text input field https://github.com/colinhacks/zod/issues/310
 */
const emptyStringToUndefined = z.literal("").transform(() => undefined);

const guestInformationSchema = z.object({
  email: z.string({ required_error: "Required" }).email("Invalid email"),
});

const accountMemberInformationSchema = z.object({
  email: z.string({ required_error: "Required" }).email("Invalid email"),
  name: z.string({ required_error: "Required" }),
});

const billingAddressSchema = z.object({
  first_name: z
    .string({ required_error: "You need to provided a first name." })
    .min(2),
  last_name: z
    .string({ required_error: "You need to provided a last name." })
    .min(2),
  company_name: z.string().min(1).optional().or(emptyStringToUndefined),
  line_1: z
    .string({ required_error: "You need to provided an address." })
    .min(1),
  line_2: z.string().min(1).optional().or(emptyStringToUndefined),
  city: z.string().min(1).optional().or(emptyStringToUndefined),
  county: z.string().min(1).optional().or(emptyStringToUndefined),
  region: z
    .string({ required_error: "You need to provided a region." })
    .optional()
    .or(emptyStringToUndefined),
  postcode: z
    .string({ required_error: "You need to provided a postcode." })
    .min(1),
  country: z
    .string({ required_error: "You need to provided a country." })
    .min(1),
});

export const shippingAddressSchema = z
  .object({
    phone_number: z
      .string()
      .regex(
        /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/,
        "Phone number is not valid",
      )
      .optional()
      .or(emptyStringToUndefined),
    instructions: z.string().min(1).optional().or(emptyStringToUndefined),
  })
  .merge(billingAddressSchema);

export const anonymousCheckoutFormSchema = z.object({
  guest: guestInformationSchema,
  shippingAddress: shippingAddressSchema,
  sameAsShipping: z.boolean().default(true),
  billingAddress: billingAddressSchema.optional().or(emptyStringToUndefined),
  shippingMethod: z
    .union([z.literal("__shipping_standard"), z.literal("__shipping_express")])
    .default("__shipping_standard"),
});

export type AnonymousCheckoutForm = z.TypeOf<
  typeof anonymousCheckoutFormSchema
>;

export const accountMemberCheckoutFormSchema = z.object({
  account: accountMemberInformationSchema,
  shippingAddress: shippingAddressSchema,
  sameAsShipping: z.boolean().default(true),
  billingAddress: billingAddressSchema.optional().or(emptyStringToUndefined),
  shippingMethod: z
    .union([z.literal("__shipping_standard"), z.literal("__shipping_express")])
    .default("__shipping_standard"),
});

export type AccountMemberCheckoutForm = z.TypeOf<
  typeof accountMemberCheckoutFormSchema
>;

export const checkoutFormSchema = z.union([
  anonymousCheckoutFormSchema,
  accountMemberCheckoutFormSchema,
]);

export type CheckoutForm = z.TypeOf<typeof checkoutFormSchema>;
