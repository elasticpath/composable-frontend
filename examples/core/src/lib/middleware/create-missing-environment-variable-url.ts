import { NonEmptyArray } from "../types/non-empty-array";

export function createMissingEnvironmentVariableUrl(
  name: string | NonEmptyArray<string>,
  reqUrl: string,
  returnPath?: string,
): URL {
  const configErrorUrl = new URL("/configuration-error", reqUrl);
  configErrorUrl.search = missingEnvironmentVariableSearchParams(
    name,
    returnPath,
  ).toString();
  return configErrorUrl;
}

export function createMissingEnvironmentVariablePath(
  lang: string,
  names: NonEmptyArray<string>,
  returnPath: string,
): string {
  return `/${lang}/configuration-error?${missingEnvironmentVariableSearchParams(names, returnPath).toString()}`;
}

function missingEnvironmentVariableSearchParams(
  name: string | NonEmptyArray<string>,
  returnPath?: string,
): URLSearchParams {
  const params = new URLSearchParams();
  if (returnPath) {
    params.set("from", returnPath);
  }
  (Array.isArray(name) ? name : [name]).forEach((n) => {
    params.append("missing-env-variable", n);
  });
  return params;
}

export function createAuthenticationErrorUrl(
  message: string,
  reqUrl: string,
  returnPath?: string,
): URL {
  const configErrorUrl = createBaseErrorUrl(reqUrl, returnPath);
  configErrorUrl.searchParams.append(
    "authentication",
    encodeURIComponent(message),
  );
  return configErrorUrl;
}

function createBaseErrorUrl(reqUrl: string, returnPath?: string): URL {
  const configErrorUrl = new URL("/configuration-error", reqUrl);
  if (returnPath) {
    configErrorUrl.searchParams.set("from", returnPath);
  }
  return configErrorUrl;
}
