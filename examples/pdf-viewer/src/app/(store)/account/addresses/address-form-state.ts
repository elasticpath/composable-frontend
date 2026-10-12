export type AddressFieldErrors = Record<string, string[] | undefined>;

export type AddressFormState = {
  attempt: number;
  message?: string;
  fieldErrors?: AddressFieldErrors;
  values?: Record<string, string>;
};

export const initialAddressFormState: AddressFormState = { attempt: 0 };

export function rejectAddressSubmission(
  previousState: AddressFormState,
  submission: FormData,
  rejection: { message: string; fieldErrors?: AddressFieldErrors },
): AddressFormState {
  const values: Record<string, string> = {};
  submission.forEach((value, key) => {
    if (typeof value === "string") {
      values[key] = value;
    }
  });

  return { attempt: previousState.attempt + 1, values, ...rejection };
}

export function isAddressSubmissionRejected(state: AddressFormState) {
  return Boolean(state.message || state.fieldErrors);
}
