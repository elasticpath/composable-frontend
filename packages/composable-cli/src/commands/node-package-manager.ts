/**
 * A union that represents the package managers available.
 */
export const packageManager = ["yarn", "npm", "pnpm", "bun", "unknown"] as const
export type PackageManager = (typeof packageManager)[number]
