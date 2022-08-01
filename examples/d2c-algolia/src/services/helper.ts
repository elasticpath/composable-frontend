import {
  gateway as EPCCGateway,
  ProductResponse,
  CatalogsProductVariation,
  ConfigOptions,
  MemoryStorageFactory,
  LocalStorageFactory,
  CustomerBase,
} from "@moltin/sdk";
import { resolveEpccCustomRuleHeaders } from "../lib/custom-rule-headers";
import { OptionDict } from "../lib/product-types";
import { epccEnv } from "../lib/resolve-epcc-env";

const headers = resolveEpccCustomRuleHeaders();

export const epccParam: ConfigOptions = {
  ...epccEnv,
  storage:
    typeof window === "undefined"
      ? new MemoryStorageFactory()
      : new LocalStorageFactory(),
  ...(headers ? { headers } : {}),
};

export const EPCCAPI = EPCCGateway(epccParam);

export async function register(
  name: string,
  email: string,
  password: string
): Promise<CustomerBase> {
  const { data } = await EPCCAPI.Customers.Create({
    type: "customer",
    name,
    email,
    password,
  });

  return data;
}

export const getSkuIdFromOptions = (
  options: string[],
  matrix: MatrixObjectEntry | MatrixValue
): string | undefined => {
  if (typeof matrix === "string") {
    return matrix;
  }

  for (const currOption in options) {
    const nestedMatrix = matrix[options[currOption]];
    if (nestedMatrix) {
      return getSkuIdFromOptions(options, nestedMatrix);
    }
  }

  return undefined;
};

export const getOptionsFromSkuId = (
  skuId: string,
  entry: MatrixObjectEntry | MatrixValue,
  options: string[] = []
): string[] | undefined => {
  if (typeof entry === "string") {
    return entry === skuId ? options : undefined;
  }

  let acc: string[] | undefined;
  Object.keys(entry).every((key) => {
    const result = getOptionsFromSkuId(skuId, entry[key], [...options, key]);
    if (result) {
      acc = result;
      return false;
    }
    return true;
  });
  return acc;
};

// TODO refactor
export const mapOptionsToVariation = (
  options: string[],
  variations: CatalogsProductVariation[]
): OptionDict => {
  return variations.reduce(
    (acc: OptionDict, variation: CatalogsProductVariation) => {
      const x = variation.options.find((varOption) =>
        options.some((selectedOption) => varOption.id === selectedOption)
      )?.id;
      return { ...acc, [variation.id]: x ? x : "" };
    },
    {}
  );
};

export function allVariationsHaveSelectedOption(
  optionsDict: OptionDict,
  variations: CatalogsProductVariation[]
): boolean {
  return !variations.some((variation) => !optionsDict[variation.id]);
}

type MatrixValue = string;

export interface MatrixObjectEntry {
  [key: string]: MatrixObjectEntry | MatrixValue;
}

export const isChildProductResource = (product: ProductResponse) =>
  !product.attributes.base_product && !!product.attributes.base_product_id;

export const isSimpleProductResource = (product: ProductResponse) =>
  !product.attributes.base_product && !product.attributes.base_product_id;

/**
 * promise will resolve after 300ms.
 */
export const wait300 = new Promise<void>((resolve) => {
  const wait = setTimeout(() => {
    clearTimeout(wait);
    resolve();
  }, 300);
});
