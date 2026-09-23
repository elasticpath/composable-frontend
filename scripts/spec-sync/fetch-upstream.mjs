#!/usr/bin/env node
/**
 * Downloads canonical OpenAPI specs from the public developer site into
 * packages/sdks/specs/upstream/, so sync-spec.mjs can refresh the working specs from them.
 *
 * Usage:
 *   node scripts/spec-sync/fetch-upstream.mjs --list             # keys whose canonical spec differs from ours
 *   node scripts/spec-sync/fetch-upstream.mjs --list --spec pim  # same, restricted to one key
 *   node scripts/spec-sync/fetch-upstream.mjs --spec pim         # download that spec into specs/upstream/
 *
 * Exit codes: 0 = done, 2 = nothing to do, 1 = error.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { BASELINE, assertBaselineResolves, specOnBaseline, versionStamp, daysBetweenStamps } from "./baseline.mjs"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const specsDir = resolve(repoRoot, "packages/sdks/specs")
const config = JSON.parse(readFileSync(resolve(specsDir, "config/canonical-map.json"), "utf8"))
const baseUrl = process.env.SPEC_SYNC_BASE_URL ?? "https://developer.elasticpath.com/assets/openapispecs"
const staleDays = Number(process.env.SPEC_SYNC_STALE_DAYS ?? 14)

const args = process.argv.slice(2)
const listMode = args.includes("--list")
const specArg = args.includes("--spec") ? args[args.indexOf("--spec") + 1] : null

function fail(msg, code = 1) {
  console.error(`fetch-upstream: ${msg}`)
  process.exit(code)
}

/**
 * The docs site answers 200 with an HTML page for a path that does not exist, so the status
 * code proves nothing. Only a body that opens an OpenAPI document counts as a spec.
 */
async function fetchSpec(key, row) {
  const url = `${baseUrl}/${row.upstream}`
  const res = await fetch(url, { redirect: "follow" })
  if (!res.ok) throw new Error(`${key}: HTTP ${res.status} for ${url}`)
  const body = await res.text()
  if (!/^openapi:\s*["']?3/m.test(body)) {
    throw new Error(`${key}: ${url} did not return an OpenAPI document (got ${body.length} bytes starting "${body.slice(0, 40).replace(/\n/g, " ")}")`)
  }
  return body
}

/** Specs this tool is allowed to refresh: a documented divergence needs a rule that does not exist yet. */
function syncable() {
  return Object.entries(config.specs).filter(([key, row]) => {
    if (specArg && key !== specArg) return false
    return row.divergence === "none"
  })
}

try {
  assertBaselineResolves()
} catch (err) {
  fail(err.message)
}

const rows = syncable()
if (specArg && rows.length === 0) {
  const row = config.specs[specArg]
  if (!row) fail(`no row for "${specArg}" in canonical-map.json`)
  fail(`"${specArg}" is marked divergence="${row.divergence}", so it is not refreshed automatically`, 2)
}

const results = await Promise.all(
  rows.map(async ([key, row]) => {
    try {
      const canonical = await fetchSpec(key, row)
      // Against the baseline, not the working tree: the sync job runs on the spec's own branch.
      const released = specOnBaseline(row.spec)
      const behindDays = daysBetweenStamps(versionStamp(canonical), versionStamp(released))
      return { key, row, canonical, changed: canonical !== released, behindDays }
    } catch (err) {
      return { key, row, error: err.message }
    }
  }),
)

const errors = results.filter((r) => r.error)
for (const r of errors) console.error(`fetch-upstream: ${r.error}`)

if (listMode) {
  const changed = results.filter((r) => !r.error && r.changed).map((r) => r.key)
  // A spec whose published stamp has run ahead of the baseline for this long stopped syncing.
  const stale = results.filter((r) => !r.error && r.changed && r.behindDays > staleDays)
  for (const r of results.filter((r) => !r.error)) {
    const age = r.changed && r.behindDays > 0 ? ` (published ${r.behindDays} day(s) ahead of ${BASELINE})` : ""
    console.error(`  ${r.key.padEnd(22)} ${r.changed ? "differs from ours" : "already current"}${age}`)
  }
  for (const r of stale) {
    console.error(`fetch-upstream: ${r.key} has been behind the published spec for ${r.behindDays} days`)
  }
  // A spec the site would not serve must not look like "already current". It is reported as an
  // error count rather than an exit code, so the specs that did download still sync; the
  // workflow's report job turns a non-zero count into a failed run afterwards.
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(
      process.env.GITHUB_OUTPUT,
      `specs=${JSON.stringify(changed)}\ncount=${changed.length}\nerrors=${errors.length}\n` +
        `stale=${JSON.stringify(stale.map((r) => `${r.key} (${r.behindDays}d)`))}\nstaleCount=${stale.length}\n`,
      { flag: "a" },
    )
  }
  if (errors.length) console.error(`fetch-upstream: ${errors.length} spec(s) could not be read from ${baseUrl}`)
  console.log(JSON.stringify(changed))
  process.exit(0)
}

if (!specArg) fail("pass --spec <key>, or --list to see what changed")
const [result] = results
if (result.error) fail(result.error)
if (!result.changed) {
  console.log(`fetch-upstream: ${result.key} already matches packages/sdks/specs/${result.row.spec} on ${BASELINE}`)
  process.exit(2)
}

const target = resolve(specsDir, "upstream", result.row.upstream)
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, result.canonical)
console.log(`fetch-upstream: wrote packages/sdks/specs/upstream/${result.row.upstream} (${result.canonical.length} bytes)`)
