export function isNoDefaultCatalogError(
  errors: object[],
): errors is [{ detail: string }] {
  const error = errors[0];
  return (
    hasDetail(error) &&
    error.detail ===
      "unable to resolve default catalog: no default catalog id can be identified: not found"
  );
}

function hasDetail(err: object): err is { detail: string } {
  return "detail" in err;
}

export function isEPError(err: unknown): err is { errors: object[] } {
  return (
    typeof err === "object" &&
    !!err &&
    hasErrors(err) &&
    Array.isArray(err.errors)
  );
}

function hasErrors(err: object): err is { errors: object[] } {
  return "errors" in err;
}
