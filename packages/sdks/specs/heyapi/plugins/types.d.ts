// generate-readme/types.d.ts

export interface Config {
  /**
   * Plugin name. Must be unique.
   */
  name: "generate-readme"
  /**
   * Name of the generated README file.
   * @default "README.md"
   */
  output?: string
  /**
   * Optional path for importing the generated SDK.
   * @default "./YOUR_GENERATED_SDK_PATH"
   */
  sdkPath?: string
  /**
   * Optional target operation to include in the README.
   */
  targetOperation?: string
  /**
   * Optional path to custom fragments directory.
   * @default "./readme-fragments"
   */
  fragmentsPath?: string
}
