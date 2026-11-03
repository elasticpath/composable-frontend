/**
 * The ref spec-sync compares published specs against, and the helpers that read it.
 *
 * The comparison asks whether the published spec differs from what is released on the baseline,
 * not from whatever the checked-out branch happens to hold.
 */
import { execFileSync } from "node:child_process"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

export const BASELINE = process.env.SPEC_SYNC_BASELINE ?? "origin/main"

const git = (args) =>
  execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  })

let checked = false

/** An unresolvable ref would silently report every spec as changed, so it is an error instead. */
export function assertBaselineResolves() {
  if (checked) return
  try {
    git(["rev-parse", "--verify", "--quiet", `${BASELINE}^{commit}`])
  } catch {
    throw new Error(
      `baseline ref "${BASELINE}" cannot be resolved. Fetch it (git fetch origin main), ` +
        `or point SPEC_SYNC_BASELINE at a ref that exists.`,
    )
  }
  checked = true
}

/** The spec as it stands on the baseline ref, or "" when the ref does not carry that file yet. */
export function specOnBaseline(specFile) {
  assertBaselineResolves()
  try {
    return git(["show", `${BASELINE}:packages/sdks/specs/${specFile}`])
  } catch {
    return "" // a spec added since the baseline, so everything published is new
  }
}

/** UTC day count between two `x-version-timestamp` values, or null when either is unreadable. */
export function daysBetweenStamps(newer, older) {
  const a = Date.parse(newer ?? "")
  const b = Date.parse(older ?? "")
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.floor((a - b) / 86_400_000)
}

/** The `info.x-version-timestamp` an OpenAPI document declares, or null. */
export function versionStamp(spec) {
  return /^\s{2}x-version-timestamp:\s*['"]?([^'"\s]+)['"]?\s*$/m.exec(spec)?.[1] ?? null
}
