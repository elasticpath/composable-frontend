export function tokenExpired(expires: number): boolean {
  return Math.floor(Date.now() / 1000) >= expires;
}
