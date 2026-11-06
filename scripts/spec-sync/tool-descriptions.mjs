#!/usr/bin/env node
/**
 * Finds the MCP tools a regenerated package would ship without a written description.
 *
 * Every operation in a package's bundled spec becomes a tool. The override decorator in
 * specs/config/redocly.yaml writes `x-mcp-description` onto an operation that has a file under
 * specs/overrides/mcp/<package>/<operationId>.yaml, and each package's mcp.test.ts fails when a
 * tool's description was not written that way. So an operation in the bundle with no
 * `x-mcp-description` is a tool that fails that test.
 *
 * Usage (after a build, which writes the bundles):
 *   node scripts/spec-sync/tool-descriptions.mjs catalogs permissions
 *   node scripts/spec-sync/tool-descriptions.mjs            # every package with an MCP server
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const sdksDir = (repoRoot) => resolve(repoRoot, "packages/sdks")

/** operationIds in a bundled spec whose operation carries no x-mcp-description */
export function operationsWithoutDescription(bundledYaml) {
  const missing = []
  let inPaths = false
  let operation = null
  const close = () => {
    if (operation && !operation.described) missing.push(operation.id)
    operation = null
  }
  for (const line of bundledYaml.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue
    const indent = line.length - line.trimStart().length
    if (indent === 0) {
      close()
      inPaths = line.startsWith("paths:")
      continue
    }
    if (!inPaths) continue
    if (indent <= 4) close()
    if (indent === 2) continue
    const method =
      indent === 4 &&
      /^\s{4}(get|put|post|delete|options|head|patch|trace):\s*$/.exec(line)
    if (method) {
      operation = { id: null, described: false }
      continue
    }
    if (!operation || indent !== 6) continue
    const field = /^\s{6}([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (!field) continue
    if (field[1] === "operationId")
      operation.id = field[2].trim().replace(/^['"]|['"]$/g, "")
    if (field[1] === "x-mcp-description") operation.described = true
  }
  close()
  return missing.filter(Boolean)
}

/** the bundled spec a package's MCP server is generated from, or null when it has no MCP server */
export function bundledSpecOf(pkg, repoRoot) {
  const configPath = resolve(sdksDir(repoRoot), pkg, "openapi-ts.config.ts")
  if (!existsSync(configPath)) return null
  const config = readFileSync(configPath, "utf8")
  if (!/\bmcp\b/.test(config)) return null
  const input = /^\s*input:\s*["']([^"']+)["']/m.exec(config)?.[1]
  if (!input) return null
  return resolve(sdksDir(repoRoot), pkg, input)
}

/** [{ package, operationId }] for every tool the given packages would ship without a description */
export function toolsWithoutDescription(packages, repoRoot) {
  const found = []
  for (const pkg of packages) {
    const bundle = bundledSpecOf(pkg, repoRoot)
    if (!bundle) continue
    if (!existsSync(bundle)) {
      throw new Error(
        `${pkg}: ${bundle} is missing; build the package first, the bundle is written by its build`,
      )
    }
    for (const operationId of operationsWithoutDescription(
      readFileSync(bundle, "utf8"),
    )) {
      found.push({ package: pkg, operationId })
    }
  }
  return found
}

export function mcpPackages(repoRoot) {
  return readdirSync(sdksDir(repoRoot)).filter(
    (pkg) => bundledSpecOf(pkg, repoRoot) !== null,
  )
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
  const packages = process.argv.slice(2)
  const missing = toolsWithoutDescription(
    packages.length ? packages : mcpPackages(repoRoot),
    repoRoot,
  )
  for (const { package: pkg, operationId } of missing) {
    console.log(
      `${pkg}: ${operationId} has no specs/overrides/mcp/${pkg}/${operationId}.yaml`,
    )
  }
  if (missing.length) process.exit(1)
  console.log("every tool has a written description")
}
