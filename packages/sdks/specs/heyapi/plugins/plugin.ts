import type { Plugin } from "@hey-api/openapi-ts"
import type { Config } from "./types"
import { IR } from "@hey-api/openapi-ts"
// @ts-ignore
import path from "path"
// @ts-ignore
import fs from "fs"
// @ts-ignore
import ejs from "ejs"

// Load environment variables from .env file
try {
  // Try to find .env file in project root
  const envPath = path.resolve(process.cwd(), "../../../.env")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8")
    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=")
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
    console.log("🔑 Loaded environment variables from .env file")
  }
} catch (error) {
  // Silently continue if .env loading fails
}

// LLM API function to summarize descriptions
async function summarizeWithLLM(
  description: string,
  operationId: string,
  method: string,
  path: string,
): Promise<string> {
  // Skip if description is already short
  if (!description || description.length < 150) {
    return description || `${method.toUpperCase()} operation`
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn("⚠️  OPENAI_API_KEY not found. Using method name fallback.")
    return `${method.toUpperCase()} operation`
  }

  try {
    const prompt = `You are a technical documentation expert. Summarize this OpenAPI operation description into 1-2 clear, concise sentences (max 200 characters).

Operation: ${method.toUpperCase()} ${path} (${operationId})

Original description:
${description}

Requirements:
- Focus ONLY on what this specific API endpoint does
- Omit generic information like "Building breadcrumbs in a storefront"
- Omit tables, examples, images, and lengthy explanations
- Omit references and links to other documentation
- Be specific about the operation's purpose
- Use professional, developer-friendly language

Summarized description:`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (summary && summary.length > 10) {
      console.log(`✨ LLM summarized: ${operationId}`)
      return summary
    } else {
      throw new Error("Empty or invalid response from LLM")
    }
  } catch (error) {
    console.warn(
      `⚠️  LLM summarization failed for ${operationId}:`,
      error.message,
    )
    return `${method.toUpperCase()} operation`
  }
}

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  // Collect operations during parsing.
  const operations: Array<IR.OperationObject> = []

  context.subscribe("operation", ({ operation }) => {
    operations.push(operation)
  })

  // Generate README after all operations have been processed.
  context.subscribe("after", async () => {
    console.log("🤖 Processing operation descriptions with LLM...")

    // Process operations with LLM summarization
    const processedOperations = await Promise.all(
      operations.map(async (op) => {
        const summarizedDescription = await summarizeWithLLM(
          op.description || "",
          op.id || "unknown",
          op.method || "GET",
          op.path || "",
        )

        return {
          ...op,
          description: summarizedDescription,
        }
      }),
    )

    console.log(
      `✅ Processed ${processedOperations.length} operations with LLM`,
    )

    // Extract metadata from package.json:
    const pkgPath = path.resolve(process.cwd(), "package.json")
    const pkg = await import(pkgPath)
    const title = pkg.name || plugin.name
    const version = pkg.version || "0.0.0"

    // Check for custom fragments directory
    const fragmentsPath = path.resolve(
      process.cwd(),
      plugin.fragmentsPath || "readme-fragments",
    )
    const customFragments: Record<string, string> = {}

    // Load custom fragments if directory exists
    if (fs.existsSync(fragmentsPath)) {
      const fragmentFiles = fs
        .readdirSync(fragmentsPath)
        .filter((file: string) => file.endsWith(".ejs") || file.endsWith(".md"))

      for (const file of fragmentFiles) {
        const fragmentName = path.basename(file, path.extname(file))
        const fragmentContent = fs.readFileSync(
          path.join(fragmentsPath, file),
          "utf8",
        )
        customFragments[fragmentName] = fragmentContent
      }

      console.info(
        `Loaded ${
          Object.keys(customFragments).length
        } custom fragments from ${fragmentsPath}`,
      )
    }

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
      operations: processedOperations, // Use LLM-processed operations
      targetOperation: plugin.targetOperation,
      customFragments,
      hasCustomFragments: Object.keys(customFragments).length > 0,
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
