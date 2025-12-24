import * as crypto from "crypto";

const RANDOM_BATCH_SIZE = 256;

let randomIndex: number | undefined;
let randomBytes: Buffer;

const getNextRandomValue = (): number => {
  if (randomIndex === undefined || randomIndex >= randomBytes.length) {
    randomIndex = 0;
    randomBytes = crypto.randomBytes(RANDOM_BATCH_SIZE);
  }

  const result = randomBytes[randomIndex]!;
  randomIndex += 1;

  return result;
};

// Generates a random number
const randomNumber = (max: number): number => {
  // gives a number between 0 (inclusive) and max (exclusive)
  let rand = getNextRandomValue();
  while (rand >= 256 - (256 % max)) {
    rand = getNextRandomValue();
  }
  return rand % max;
};

// Possible combinations
const lowercase = "abcdefghijklmnopqrstuvwxyz";
const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = '!@#$%^&*()+_-=}{[]|:;"/?.><,`~';
const similarCharacters = /[ilLI|`oO0]/g;

interface StrictRule {
  name: string;
  rule: RegExp;
}

const strictRules: StrictRule[] = [
  { name: "lowercase", rule: /[a-z]/ },
  { name: "uppercase", rule: /[A-Z]/ },
  { name: "numbers", rule: /[0-9]/ },
  { name: "symbols", rule: /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/ },
];

interface PasswordOptions {
  length?: number;
  numbers?: boolean;
  symbols?: boolean | string;
  exclude?: string;
  uppercase?: boolean;
  lowercase?: boolean;
  excludeSimilarCharacters?: boolean;
  strict?: boolean;
}

const generate = (options: PasswordOptions, pool: string): string => {
  let password = "";
  const optionsLength = options.length;
  const poolLength = pool.length;

  for (let i = 0; i < optionsLength!; i++) {
    password += pool[randomNumber(poolLength)];
  }

  if (options.strict) {
    // Iterate over each rule, checking to see if the password works.
    const fitsRules = strictRules.every((rule) => {
      // If the option is not checked, ignore it.
      if (options[rule.name as keyof PasswordOptions] == false) return true;

      // Treat symbol differently if explicit string is provided
      if (
        rule.name === "symbols" &&
        typeof options[rule.name as keyof PasswordOptions] === "string"
      ) {
        // Create a regular expression from the provided symbols
        const re = new RegExp(
          "[" + options[rule.name as keyof PasswordOptions] + "]",
        );
        return re.test(password);
      }

      // Run the regex on the password and return whether
      // or not it matches.
      return rule.rule.test(password);
    });

    // If it doesn't fit the rules, generate a new one (recursion).
    if (!fitsRules) return generate(options, pool);
  }

  return password;
};

// Generate a random password.
export const generatePassword = (options: PasswordOptions = {}): string => {
  // Set defaults.
  if (!options.hasOwnProperty("length")) options.length = 10;
  if (!options.hasOwnProperty("numbers")) options.numbers = false;
  if (!options.hasOwnProperty("symbols")) options.symbols = false;
  if (!options.hasOwnProperty("exclude")) options.exclude = "";
  if (!options.hasOwnProperty("uppercase")) options.uppercase = true;
  if (!options.hasOwnProperty("lowercase")) options.lowercase = true;
  if (!options.hasOwnProperty("excludeSimilarCharacters"))
    options.excludeSimilarCharacters = false;
  if (!options.hasOwnProperty("strict")) options.strict = false;

  if (options.strict) {
    const minStrictLength =
      1 +
      (options.numbers ? 1 : 0) +
      (options.symbols ? 1 : 0) +
      (options.uppercase ? 1 : 0);
    if (minStrictLength > options.length!) {
      throw new TypeError("Length must correlate with strict guidelines");
    }
  }

  // Generate character pool
  let pool = "";

  // lowercase
  if (options.lowercase) {
    pool += lowercase;
  }

  // uppercase
  if (options.uppercase) {
    pool += uppercase;
  }
  // numbers
  if (options.numbers) {
    pool += numbers;
  }
  // symbols
  if (options.symbols) {
    if (typeof options.symbols === "string") {
      pool += options.symbols;
    } else {
      pool += symbols;
    }
  }

  // Throw error if pool is empty.
  if (!pool) {
    throw new TypeError("At least one rule for pools must be true");
  }

  // similar characters
  if (options.excludeSimilarCharacters) {
    pool = pool.replace(similarCharacters, "");
  }

  // excludes characters from the pool
  let i = options.exclude!.length;
  while (i--) {
    pool = pool.replace(new RegExp(`[${options.exclude![i]}]`, "g"), "");
  }

  const password = generate(options, pool);

  return password;
};

// Generates multiple passwords at once with the same options.
export const generateMultiplePasswords = (
  amount: number,
  options: PasswordOptions,
): string[] => {
  const passwords: string[] = [];

  for (let i = 0; i < amount; i++) {
    passwords[i] = generatePassword(options);
  }

  return passwords;
};

export {
  generatePassword as generate,
  generateMultiplePasswords as generateMultiple,
};
