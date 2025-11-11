export function isSupportedExtension(value: unknown): boolean {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "undefined" ||
    value === null
  );
}
