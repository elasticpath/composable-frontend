import type { Plugin } from "@hey-api/openapi-ts"
import type { Config } from "./types"
import { IR } from "@hey-api/openapi-ts"
// @ts-ignore
import path from "path"
// @ts-ignore
import fs from "fs"
// @ts-ignore
import ejs from "ejs"

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  // Collect operations during parsing.
  const operations: Array<IR.OperationObject> = []

  context.subscribe("operation", ({ operation }) => {
    operations.push(operation)
  })

  // Generate README after all operations have been processed.
  context.subscribe("after", async () => {
    // Extract metadata from package.json:
    const pkgPath = path.resolve(process.cwd(), "package.json")
    const pkg = await import(pkgPath)
    const title = pkg.name || plugin.name
    const version = pkg.version || "0.0.0"

    // Resolve and read the EJS template file.
    const templatePath = path.resolve(
      __dirname,
      "../readme-gen/readmeTemplate.ejs",
    )
    const template = fs.readFileSync(templatePath, "utf8")

    // Data object passed to the template.
    const data = {
      name: title,
      importPath: title,
      version,
      operations,
      targetOperation: plugin.targetOperation,
    }

    // Render the template with the provided data.
    const readmeContent = ejs.render(template, data, { filename: templatePath })

    // Determine the output path (adjust as needed)
    const outputPath = path.resolve(plugin.output || "README.md")

    // Write the file directly to disk
    try {
      fs.writeFileSync(outputPath, readmeContent, "utf8")
      console.info(
        `Generated ${title} ${plugin.output || "README.md"} successfully.`,
      )
    } catch (error) {
      console.error("Error writing README file:", error)
    }
  })
}
