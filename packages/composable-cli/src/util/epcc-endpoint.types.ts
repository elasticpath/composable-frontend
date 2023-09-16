export type EPCCEndpointResult<D, E> =
  | { success: true; data: D }
  | { success: false; error: E }
