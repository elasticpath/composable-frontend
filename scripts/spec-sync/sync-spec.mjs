#!/usr/bin/env node
/**
 * Takes a spec downloaded into packages/sdks/specs/upstream/ by fetch-upstream.mjs, refreshes the
 * working spec from it, regenerates the affected clients, writes a changeset whose
 * bump type is derived from the export diff, and reports any export that disappeared.
 *
 * Usage:
 *   node scripts/spec-sync/sync-spec.mjs --spec pricebooks
 *   node scripts/spec-sync/sync-spec.mjs --spec pricebooks --dry-run
 *
 * Exit codes: 0 = synced (check summary.exportsRemoved), 2 = nothing to do,
 * 3 = refused (divergence needs a rule that does not exist yet), 4 = would not build.
 */
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const specsDir = resolve(repoRoot, "packages/sdks/specs")
const configPath = resolve(specsDir, "config/canonical-map.json")
const BASELINE = process.env.SPEC_SYNC_BASELINE ?? "origin/main"

const args = process.argv.slice(2)
const specKey = args[args.indexOf("--spec") + 1]
const dryRun = args.includes("--dry-run")
if (!specKey || specKey.startsWith("--")) fail("pass --spec <key> (a key from canonical-map.json)")

const sh = (cmd, cmdArgs, opts = {}) =>
  execFileSync(cmd, cmdArgs, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts })

function fail(msg, code = 1) {
  console.error(`spec-sync: ${msg}`)
  process.exit(code)
}

/** export names a package's generated client exposes, from a given git ref or the working tree */
function exportsOf(pkg, ref) {
  const names = new Set()
  for (const file of ["types.gen.ts", "sdk.gen.ts"]) {
    const path = `packages/sdks/${pkg}/src/client/${file}`
    let src
    try {
      src = ref
        ? sh("git", ["show", `${ref}:${path}`])
        : readFileSync(resolve(repoRoot, path), "utf8")
    } catch {
      continue // file absent on that ref, or not generated yet
    }
    for (const m of src.matchAll(/^export (?:type|const|function) ([A-Za-z0-9_]+)/gm)) names.add(m[1])
  }
  return names
}

const config = JSON.parse(readFileSync(configPath, "utf8"))
const row = config.specs[specKey]
if (!row) fail(`no row for "${specKey}" in ${configPath}`)

if (row.divergence !== "none") {
  fail(
    `"${specKey}" is marked divergence="${row.divergence}"${row.note ? ` (${row.note})` : ""}. ` +
      `Refreshing it needs a rule that does not exist yet. Left untouched.`,
    3,
  )
}

const upstreamPath = resolve(specsDir, "upstream", row.upstream)
const workingPath = resolve(specsDir, row.spec)
if (!existsSync(upstreamPath)) fail(`nothing downloaded to specs/upstream/${row.upstream}`, 2)

const upstream = readFileSync(upstreamPath, "utf8")
const working = existsSync(workingPath) ? readFileSync(workingPath, "utf8") : ""
if (upstream === working) {
  console.log(`spec-sync: specs/${row.spec} already matches upstream. Nothing to do.`)
  process.exit(2)
}

// Packages this refresh regenerates: the spec's own package, plus shopper when the
// spec is one of the eleven inputs redocly joins into shopper.yaml.
const packages = [row.package, row.shopperJoin ? "shopper" : null].filter(Boolean)
const packageNames = [row.packageName, row.shopperJoin ? "@epcc-sdk/sdks-shopper" : null].filter(Boolean)

console.log(`spec-sync: ${specKey}`)
console.log(`  upstream : specs/upstream/${row.upstream}`)
console.log(`  working  : specs/${row.spec}`)
console.log(`  packages : ${packageNames.join(", ") || "(none)"}`)

const before = Object.fromEntries(packages.map((p) => [p, exportsOf(p, BASELINE)]))
for (const p of packages) {
  if (before[p].size === 0) console.warn(`  warn: no baseline exports read for ${p} at ${BASELINE}`)
}

if (dryRun) {
  console.log("spec-sync: --dry-run, stopping before the copy")
  process.exit(0)
}

copyFileSync(upstreamPath, workingPath)

// --force stays even though turbo.json now hashes the specs: a cache hit restores only
// `outputs` (dist/**), and src/client, which this script commits, is not one.
const filters = packageNames.flatMap((n) => ["--filter", n])
if (filters.length) {
  console.log("spec-sync: regenerating…")
  try {
    sh("pnpm", ["exec", "turbo", "run", "build", ...filters, "--force"], { stdio: "inherit" })
  } catch {
    // A gate outcome, not a crash. The cause is as often our own code as the spec.
    fail(`regeneration failed for ${packageNames.join(", ")}. See the build output above.`, 4)
  }
}

// Every package build rewrites its own README; revert that churn. Listed by directory, not by
// glob: a wider pathspec also matches hand-written docs and deletes uncommitted edits to them.
sh("git", ["restore", "--staged", "--worktree", ":(icase,glob)packages/*/readme.md", ":(icase,glob)packages/sdks/*/readme.md"], { stdio: "inherit" })

const after = Object.fromEntries(packages.map((p) => [p, exportsOf(p, null)]))
const removed = []
const added = []
for (const p of packages) {
  for (const name of before[p]) if (!after[p].has(name)) removed.push(`${p}: ${name}`)
  for (const name of after[p]) if (!before[p].has(name)) added.push(`${p}: ${name}`)
}

// Bump type from the export diff, not a fixed value: a removed export is a break the gate
// holds back, a new export is a feature, and a description-only refresh is a patch.
const bump = removed.length > 0 ? "major" : added.length > 0 ? "minor" : "patch"

// What actually goes in the changeset. Every SDK here is pre-1.0, where changesets treats
// `minor` as the breaking bump (0.0.2 -> 0.1.0) and `major` would jump it to 1.0.0 and
// claim a stability these packages do not have. So a breaking regeneration is written as
// `minor` and says so in its body.
const changesetBump = bump === "major" ? "minor" : bump

const upstreamVersion = /^\s{2}version:\s*(.+)$/m.exec(upstream)?.[1]?.trim()
const upstreamStamp = /^\s{2}x-version-timestamp:\s*(.+)$/m.exec(upstream)?.[1]?.trim()
const provenance = [upstreamVersion && `spec version ${upstreamVersion}`, upstreamStamp && `published ${upstreamStamp}`]
  .filter(Boolean)
  .join(", ")

if (packageNames.length) {
  const changesetPath = resolve(repoRoot, `.changeset/spec-sync-${specKey.replace(/_/g, "-")}.md`)
  const frontmatter = packageNames.map((n) => `"${n}": ${changesetBump}`).join("\n")
  const body =
    `Regenerate from the upstream \`${specKey}\` spec` +
    (provenance ? ` (${provenance})` : "") +
    "." +
    (added.length ? `\n\nAdds ${added.length} exported symbol${added.length === 1 ? "" : "s"}.` : "") +
    (removed.length
      ? `\n\n**Breaking.** Removes ${removed.length} exported symbol${removed.length === 1 ? "" : "s"}:\n\n` +
        removed.map((r) => `- \`${r}\``).join("\n")
      : "")
  writeFileSync(changesetPath, `---\n${frontmatter}\n---\n\n${body}\n`)
  console.log(`spec-sync: wrote ${changesetPath.replace(repoRoot + "/", "")} (${changesetBump})`)
}

// Examples that import one of the regenerated packages. Only these can break, so only
// these are worth typechecking; a spec with no dependent example skips that step entirely.
const affectedExamples = []
const examplesDir = resolve(repoRoot, "examples")
for (const entry of existsSync(examplesDir) ? readdirSync(examplesDir) : []) {
  const manifest = resolve(examplesDir, entry, "package.json")
  if (!existsSync(manifest)) continue
  const pkg = JSON.parse(readFileSync(manifest, "utf8"))
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
  if (pkg.scripts?.["type:check"] && packageNames.some((n) => deps.includes(n))) {
    affectedExamples.push(pkg.name)
  }
}

// Exactly what this refresh is allowed to commit. Staging whole directories instead sweeps
// up build artifacts the refresh did not cause: `pnpm build:packages` rewrites
// specs/shopper.yaml on every run, so a spec that does not even feed the shopper join was
// carrying a shopper.yaml diff into its pull request.
const paths = [
  `packages/sdks/specs/${row.spec}`,
  `packages/sdks/specs/upstream/${row.upstream}`,
  ...packages.map((p) => `packages/sdks/${p}/src/client`),
  ...(row.shopperJoin ? ["packages/sdks/specs/shopper.yaml"] : []),
  ...(packageNames.length ? [`.changeset/spec-sync-${specKey.replace(/_/g, "-")}.md`] : []),
]

const summary = {
  spec: specKey,
  specFile: row.spec,
  paths,
  packages: packageNames,
  affectedExamples,
  upstreamVersion: upstreamVersion ?? null,
  upstreamTimestamp: upstreamStamp ?? null,
  bump,
  changesetBump,
  exportsAdded: added,
  exportsRemoved: removed,
  breaking: removed.length > 0,
}
const summaryPath = process.env.SPEC_SYNC_SUMMARY ?? resolve(process.env.RUNNER_TEMP ?? tmpdir(), "spec-sync-summary.json")
writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
console.log(`spec-sync: summary at ${summaryPath}`)

console.log(
  `spec-sync: +${added.length} exports, -${removed.length} exports, ` +
    `${bump === "major" ? `breaking (changeset: ${changesetBump}, pre-1.0)` : `bump=${bump}`}`,
)
if (removed.length) {
  console.log("spec-sync: exports removed —")
  for (const name of removed) console.log(`  - ${name}`)
}
if (process.env.GITHUB_OUTPUT) {
  writeFileSync(
    process.env.GITHUB_OUTPUT,
    `breaking=${summary.breaking}\nbump=${bump}\nadded=${added.length}\nremoved=${removed.length}\n`,
    { flag: "a" },
  )
}
