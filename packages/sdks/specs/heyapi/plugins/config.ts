// @ts-ignore
import type { Plugin } from "@hey-api/openapi-ts"
import { handler } from "./plugin"
import type { Config } from "./types"

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: [], // no extra dependencies required for this plugin
  _handler: handler,
  _handlerLegacy: () => {},
  name: "generate-readme",
  output: "README.md",
  sdkPath: "./YOUR_GENERATED_SDK_PATH",
}

/**
 * Type helper for `generate-readme` plugin.
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config: any) => ({
  ...defaultConfig,
  ...config,
})
