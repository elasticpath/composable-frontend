export type HTTPMethod =
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

export const isSupportedMethod = (
  requestedMethod: HTTPMethod | string,
  supportedMethods: HTTPMethod[]
): boolean => {
  return !!supportedMethods.find((method) => method === requestedMethod);
};
