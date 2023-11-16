const path = require("path");

/**
 *  Using next lint with lint-staged requires this setup
 *  https://nextjs.org/docs/basic-features/eslint#lint-staged
 */

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

/**
 * () => "npm run type:check"
 * needs to be a function because arguments are getting passed from lint-staged
 * when those arguments get through to the "tsc" command that "npm run type:check"
 * is calling the args cause "tsc" to ignore the tsconfig.json in our root directory.
 * https://github.com/microsoft/TypeScript/issues/27379
 */
module.exports = {
  "*.{js,jsx}": [
    "npm run format:fix",
    buildEslintCommand,
    "npm run format:check",
  ],
  "*.{ts,tsx}": [
    "npm run format:fix",
    () => "npm run type:check",
    buildEslintCommand,
    "npm run format:check",
  ],
};
