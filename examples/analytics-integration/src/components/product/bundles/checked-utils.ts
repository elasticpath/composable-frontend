import { bigIntReviver, bigIntToNumberReplacer } from "./form-parsers";

export function checkOption(
  values: string[],
  optionId: string,
  optionQuantity: number,
): string[] {
  // Check if any of the existing objects already have the option
  const hasOption = values.some((value) => {
    const parsed = JSON.parse(value, bigIntReviver);
    return !!parsed[optionId];
  });

  // If not, return the original values plus a new object with the option
  if (!hasOption) {
    return [
      ...values,
      JSON.stringify(
        { [optionId]: BigInt(optionQuantity) },
        bigIntToNumberReplacer,
      ),
    ];
  }

  // Otherwise, update the objects that already have the option.
  return values.map((value) => {
    const parsed = JSON.parse(value, bigIntReviver);
    if (parsed[optionId]) {
      return JSON.stringify(
        { ...parsed, [optionId]: BigInt(optionQuantity) },
        bigIntToNumberReplacer,
      );
    }
    return value;
  });
}

export function uncheckOption(values: string[], optionId: string): string[] {
  return values.reduce((acc, curr) => {
    const parsed = JSON.parse(curr, bigIntReviver);
    if (parsed[optionId]) {
      const { [optionId]: removed, ...rest } = parsed; // eslint-disable-line no-use-before-define
      if (Object.keys(rest).length > 0) {
        acc.push(JSON.stringify(rest, bigIntToNumberReplacer));
      }
    } else {
      // Preserve objects that don't have the target option
      acc.push(curr);
    }
    return acc;
  }, [] as string[]);
}

export function isChecked(values: string[], optionId: string) {
  return values.some((value) => {
    const parsed = JSON.parse(value, bigIntReviver);
    return !!parsed[optionId];
  });
}
