import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const dataTagSymbols = ["dataTagSymbol", "dataTagErrorSymbol"]

const reactQueryDeclarationFiles = [
  "dist/client/@tanstack/react-query.gen.d.ts",
  "dist/client/@tanstack/react-query.gen.d.cts",
]

function isImported(declarations, name) {
  return new RegExp(`^import [^;]*\\b${name}\\b[^;]* from `, "m").test(
    declarations,
  )
}

export function importDataTagSymbols(declarations) {
  const unimported = dataTagSymbols.filter(
    (name) =>
      declarations.includes(`[${name}]`) && !isImported(declarations, name),
  )
  if (unimported.length === 0) return declarations
  return `import { ${unimported.join(
    ", ",
  )} } from '@tanstack/react-query';\n${declarations}`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const file of reactQueryDeclarationFiles) {
    writeFileSync(file, importDataTagSymbols(readFileSync(file, "utf8")))
  }
}
