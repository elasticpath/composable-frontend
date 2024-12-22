import { z } from "zod";
import type {
  BundleComponent,
  BundleComponents,
} from "@elasticpath/react-shopper-hooks";

export const createBundleComponentSchema = (component: BundleComponent) => {
  let schema = z.array(z.string());

  const { min, max } = component;

  if (min) {
    schema = schema.min(min, `Must select at least ${min} options`);
  }

  if (max) {
    schema = schema.max(max, `Must select no more than ${max} options`);
  }
  return schema;
};

export const createBundleFormSchema = (bundleComponents: BundleComponents) => {
  const selectedOptionsSchema = Object.keys(bundleComponents).reduce(
    (acc, componentKey) => {
      return {
        ...acc,
        [componentKey]: createBundleComponentSchema(
          bundleComponents[componentKey],
        ),
      };
    },
    {} as Record<string, ReturnType<typeof createBundleComponentSchema>>,
  );

  return z.object({
    selectedOptions: z.object(selectedOptionsSchema),
  });
};
