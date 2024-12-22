import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCounterProps {
  /**
   * The callback fired when the value changes
   */
  onChange?(valueAsString: string, valueAsNumber: number): void;
  /**
   * The number of decimal points used to round the value
   */
  precision?: number;
  /**
   * The initial value of the counter. Should be less than `max` and greater than `min`
   */
  defaultValue?: string | number;
  /**
   * The value of the counter. Should be less than `max` and greater than `min`
   */
  value?: string | number;
  /**
   * The step used to increment or decrement the value
   * @default 1
   */
  step?: number;
  /**
   * The minimum value of the counter
   * @default Number.MIN_SAFE_INTEGER
   */
  min?: number;
  /**
   * The maximum value of the counter
   * @default Number.MAX_SAFE_INTEGER
   */
  max?: number;
  /**
   * This controls the value update behavior in general.
   *
   * - If `true` and you use the stepper or up/down arrow keys,
   *  the value will not exceed the `max` or go lower than `min`
   *
   * - If `false`, the value will be allowed to go out of range.
   *
   * @default true
   */
  keepWithinRange?: boolean;
}

export function useCounter(props: UseCounterProps = {}) {
  const {
    onChange,
    precision: precisionProp,
    defaultValue,
    value: valueProp,
    step: stepProp = 1,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    keepWithinRange = true,
  } = props;

  const onChangeProp = useCallbackRef(onChange);

  const [valueState, setValue] = useState<string | number>(() => {
    if (defaultValue == null) return "";
    return cast(defaultValue, stepProp, precisionProp) ?? "";
  });

  /**
   * Because the component that consumes this hook can be controlled or uncontrolled
   * we'll keep track of that
   */
  const isControlled = typeof valueProp !== "undefined";
  const value = isControlled ? valueProp : valueState;

  const decimalPlaces = getDecimalPlaces(parse(value), stepProp);

  const precision = precisionProp ?? decimalPlaces;

  const update = useCallback(
    (next: string | number) => {
      if (next === value) return;
      if (!isControlled) {
        setValue(next.toString());
      }
      onChangeProp?.(next.toString(), parse(next));
    },
    [onChangeProp, isControlled, value],
  );

  // Function to clamp the value and round it to the precision
  const clamp = useCallback(
    (value: number) => {
      let nextValue = value;

      if (keepWithinRange) {
        nextValue = clampValue(nextValue, min, max);
      }

      return toPrecision(nextValue, precision);
    },
    [precision, keepWithinRange, max, min],
  );

  const increment = useCallback(
    (step = stepProp) => {
      let next: string | number;

      /**
       * Let's follow the native browser behavior for
       * scenarios where the input starts empty ("")
       */
      if (value === "") {
        /**
         * If `min` is set, native input, starts at the `min`.
         * Else, it starts at `step`
         */
        next = parse(step);
      } else {
        next = parse(value) + step;
      }

      next = clamp(next as number);
      update(next);
    },
    [clamp, stepProp, update, value],
  );

  const decrement = useCallback(
    (step = stepProp) => {
      let next: string | number;

      // Same thing here. We'll follow native implementation
      if (value === "") {
        next = parse(-step);
      } else {
        next = parse(value) - step;
      }

      next = clamp(next as number);
      update(next);
    },
    [clamp, stepProp, update, value],
  );

  const reset = useCallback(() => {
    let next: string | number;
    if (defaultValue == null) {
      next = "";
    } else {
      next = cast(defaultValue, stepProp, precisionProp) ?? min;
    }
    update(next);
  }, [defaultValue, precisionProp, stepProp, update, min]);

  const castValue = useCallback(
    (value: string | number) => {
      const nextValue = cast(value, stepProp, precision) ?? min;
      update(nextValue);
    },
    [precision, stepProp, update, min],
  );

  const valueAsNumber = parse(value);

  /**
   * Common range checks
   */
  const isOutOfRange = valueAsNumber > max || valueAsNumber < min;
  const isAtMax = valueAsNumber === max;
  const isAtMin = valueAsNumber === min;

  return {
    isOutOfRange,
    isAtMax,
    isAtMin,
    precision,
    value,
    valueAsNumber,
    update,
    reset,
    increment,
    decrement,
    clamp,
    cast: castValue,
    setValue,
  };
}

export type UseCounterReturn = ReturnType<typeof useCounter>;

function parse(value: string | number) {
  return parseFloat(value.toString().replace(/[^\w.-]+/g, ""));
}

function getDecimalPlaces(value: number, step: number) {
  return Math.max(countDecimalPlaces(step), countDecimalPlaces(value));
}

function cast(value: string | number, step: number, precision?: number) {
  const parsedValue = parse(value);
  if (Number.isNaN(parsedValue)) return undefined;
  const decimalPlaces = getDecimalPlaces(parsedValue, step);
  return toPrecision(parsedValue, precision ?? decimalPlaces);
}

/**
 * Counts the number of decimal places a number has
 *
 * @param value the decimal value to count
 */
export function countDecimalPlaces(value: number) {
  if (!Number.isFinite(value)) return 0;

  let e = 1;
  let p = 0;
  while (Math.round(value * e) / e !== value) {
    e *= 10;
    p += 1;
  }
  return p;
}

/**
 * Clamps a value to ensure it stays within the min and max range.
 *
 * @param value the value to clamp
 * @param min the minimum value
 * @param max the maximum value
 */
export function clampValue(value: number, min: number, max: number) {
  if (value == null) return value;

  if (max < min && process.env.NODE_ENV !== "production") {
    console.warn("clamp: max cannot be less than min");
  }

  return Math.min(Math.max(value, min), max);
}

/**
 * Converts a value to a specific precision (or decimal points).
 *
 * Returns a string representing a number in fixed-point notation.
 *
 * @param value the value to convert
 * @param precision the precision or decimal points
 */
export function toPrecision(value: number, precision?: number) {
  let nextValue: string | number = toNumber(value);
  const scaleFactor = 10 ** (precision ?? 10);
  nextValue = Math.round(nextValue * scaleFactor) / scaleFactor;
  return precision ? nextValue.toFixed(precision) : nextValue.toString();
}

function toNumber(value: any) {
  const num = parseFloat(value);
  return isNotNumber(num) ? 0 : num;
}

export function isNotNumber(value: any) {
  return (
    typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)
  );
}

export function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: React.DependencyList = [],
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args) => callbackRef.current?.(...args)) as T, deps);
}
