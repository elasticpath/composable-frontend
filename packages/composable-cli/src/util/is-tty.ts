export function isTTY(): boolean {
  const isTruthy = (value: undefined | string) => {
    // Returns true if value is a string that is anything but 0 or false.
    return (
      value !== undefined && value !== "0" && value.toUpperCase() !== "FALSE"
    )
  }

  // If we force TTY, we always return true.
  const force = process.env["NG_FORCE_TTY"]
  if (force !== undefined) {
    return isTruthy(force)
  }

  return !!process.stdout.isTTY && !isTruthy(process.env["CI"])
}
