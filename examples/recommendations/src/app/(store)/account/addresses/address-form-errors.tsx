export function AddressFieldError({
  id,
  errors,
}: {
  id: string;
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <span
      id={id}
      role="alert"
      className="mt-1 block text-sm font-medium text-red-600"
    >
      {errors[0]}
    </span>
  );
}

export function AddressFormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="text-sm font-medium text-red-600">
      {message}
    </p>
  );
}
