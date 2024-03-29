#!/usr/bin/env ts-node
import { compileFromFile } from "json-schema-to-typescript"
import path from "path"
import fs from "fs-extra"
import chalk from "chalk"
import globby, { GlobbyOptions } from "globby"
import { createLogger, Logger } from "./util/simple-logger"

interface Asset {
  from: string
  to: string
}

export async function jsonSchemaToDts(
  options: Partial<{
    assets: Asset[]
    resolveFrom: string
    verbose: boolean
    globbyOptions: GlobbyOptions
  }>
) {
  const {
    assets = [],
    resolveFrom = "out",
    verbose = false,
    globbyOptions = {},
  } = options
  console.log("Running json schema to dts script")
  const logger = options.verbose ? createLogger() : { log: () => {} }

  let outDirResolve

  if (resolveFrom === "cwd") {
    outDirResolve = process.cwd()
  } else if (resolveFrom === "out") {
    const outDir = path.dirname("dist")

    if (!outDir) {
      logger.log(
        chalk.red(
          `You should provide valid ${chalk.white("outdir")} or ${chalk.white(
            "outfile"
          )} for assets copy. received outdir:${outDir}, received outfile:${undefined}`
        )
      )

      return
    }

    outDirResolve = outDir
  } else {
    outDirResolve = resolveFrom
  }

  logger.log(`Resolve assert to path from: ${path.resolve(outDirResolve)}`)

  for (const { to, from } of assets) {
    const pathsCopyFrom = await globby(from, {
      expandDirectories: false,
      onlyFiles: true,
      ...globbyOptions,
    })

    const deduplicatedPaths = [...new Set(pathsCopyFrom)]

    if (!deduplicatedPaths.length) {
      logger.log(
        `No files matched using current glob pattern: ${chalk.white(
          from
        )}, maybe you need to configure globby by ${chalk.white(
          "options.globbyOptions"
        )}?`
      )
    }

    for (const fromPath of deduplicatedPaths) {
      keepStructureJSONConvertHandler(outDirResolve, from, fromPath, to, logger)
    }
  }
  console.log("Completed json schema to dts script")
}

const BANNER_COMMENT =
  "/* tslint:disable */\n/**\n* This file was automatically generated by json schema to dts.\n* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,\n* and run the script to regenerate this file.\n*/"

function keepStructureJSONConvertHandler(
  outDir: string,
  rawFromPath: string,
  globbedFromPath: string,
  baseToPath: string,
  logger: Logger
) {
  // we keep structure only when input from path ends with /**/*(.ext)
  // for \/* only, we use simple merge copy handler
  // we only support /**/* now
  // and /**/*.js?
  const { dir } = path.parse(rawFromPath)

  const startFragment = dir.replace(`/**`, "")
  logger.log(
    `startFragment: ${chalk.red(
      startFragment
    )} globbedFromPath: ${globbedFromPath} globbedFromPath.split(startFragment): ${globbedFromPath.split(
      startFragment
    )}`
  )

  const preservedDirStructure = globbedFromPath.startsWith(startFragment)
    ? globbedFromPath.split(startFragment)[1]
    : globbedFromPath

  logger.log(`preservedDirStructure: ${chalk.green(preservedDirStructure)}`)

  const sourcePath = path.resolve(globbedFromPath)
  logger.log(
    `outDir: ${outDir} baseToPath: ${baseToPath} preservedDirStructure: ${preservedDirStructure.slice(
      1
    )}`
  )
  const composedDistDirPath = path.resolve(
    outDir,
    baseToPath,
    preservedDirStructure
  )

  compileFromFile(sourcePath, {
    bannerComment: BANNER_COMMENT,
  }).then((ts) => {
    const { name } = path.parse(sourcePath)
    fs.ensureDirSync(path.dirname(composedDistDirPath))
    fs.writeFileSync(`${path.parse(composedDistDirPath).dir}/${name}.d.ts`, ts)
    logger.log(
      `inside file copied: ${chalk.white(sourcePath)} -> ${chalk.white(
        `${path.parse(composedDistDirPath).dir}/${name}.d.ts`
      )}`
    )
  })

  logger.log(
    `File copied: ${chalk.white(sourcePath)} -> ${chalk.white(
      composedDistDirPath
    )}`
  )
}

jsonSchemaToDts({
  verbose: false,
  assets: [{ from: process.argv[2], to: process.argv[3] }],
})
