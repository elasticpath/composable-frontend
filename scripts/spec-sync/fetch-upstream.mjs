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
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const specsDir = resolve(repoRoot, "packages/sdks/specs")
const config = JSON.parse(readFileSync(resolve(specsDir, "config/canonical-map.json"), "utf8"))
const baseUrl = process.env.SPEC_SYNC_BASE_URL ?? "https://developer.elasticpath.com/assets/openapispecs"

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
      const workingPath = resolve(specsDir, row.spec)
      const working = existsSync(workingPath) ? readFileSync(workingPath, "utf8") : ""
      return { key, row, canonical, changed: canonical !== working }
    } catch (err) {
      return { key, row, error: err.message }
    }
  }),
)

const errors = results.filter((r) => r.error)
for (const r of errors) console.error(`fetch-upstream: ${r.error}`)

if (listMode) {
  const changed = results.filter((r) => !r.error && r.changed).map((r) => r.key)
  for (const r of results.filter((r) => !r.error)) {
    console.error(`  ${r.key.padEnd(22)} ${r.changed ? "differs from ours" : "already current"}`)
  }
  // A spec the site would not serve must not look like "already current", so a failed fetch
  // fails the run even when other specs listed cleanly.
  if (errors.length) fail(`${errors.length} spec(s) could not be read from ${baseUrl}`)
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(process.env.GITHUB_OUTPUT, `specs=${JSON.stringify(changed)}\ncount=${changed.length}\n`, { flag: "a" })
  }
  console.log(JSON.stringify(changed))
  process.exit(0)
}

if (!specArg) fail("pass --spec <key>, or --list to see what changed")
const [result] = results
if (result.error) fail(result.error)
if (!result.changed) {
  console.log(`fetch-upstream: ${result.key} already matches packages/sdks/specs/${result.row.spec}`)
  process.exit(2)
}

const target = resolve(specsDir, "upstream", result.row.upstream)
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, result.canonical)
console.log(`fetch-upstream: wrote packages/sdks/specs/upstream/${result.row.upstream} (${result.canonical.length} bytes)`)
