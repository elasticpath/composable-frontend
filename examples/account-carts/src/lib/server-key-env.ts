import "server-only"

export function serverKeyEnv() {
  return {
    EPCC_CLIENT_ID: process.env.EPCC_CLIENT_ID,
    EPCC_CLIENT_SECRET: process.env.EPCC_CLIENT_SECRET,
  }
}
