import { NonEmptyArray } from "../types/non-empty-array";

export function createMissingEnvironmentVariableUrl(
  name: string | NonEmptyArray<string>,
  reqUrl: string,
  from?: string
): URL {
  const configErrorUrl = createBaseErrorUrl(reqUrl, from);

  (Array.isArray(name) ? name : [name]).forEach((n) => {
    configErrorUrl.searchParams.append("missing-env-variable", n);
  });

  return configErrorUrl;
}

export function createAuthenticationErrorUrl(
  message: string,
  reqUrl: string,
  from?: string
): URL {
  const configErrorUrl = createBaseErrorUrl(reqUrl, from);
  configErrorUrl.searchParams.append(
    "authentication",
    encodeURIComponent(message)
  );
  return configErrorUrl;
}

function createBaseErrorUrl(reqUrl: string, from?: string): URL {
  const configErrorUrl = new URL("/configuration-error", reqUrl);
  if (from) {
    configErrorUrl.searchParams.set("from", from);
  }
  return configErrorUrl;
}
