import { PasswordCharacters } from './PasswordCharacters';
import { PasswordRule } from './PasswordRule';

/**
 * A custom and simple password generator.
 *
 * This is heavily based upon the ['generate-password'](https://github.com/brendanashworth/generate-password) nodejs package by Brandan Ashworth, however it fixes some issues.
 * At some point in time the package above threw 'undefined' errors because of a caching algorithm they introduced.
 * This re-implementation:
 * - Fixes this issues
 * - Is actually type- & null-safe.
 */
export class PasswordGenerator {
  private readonly rules: PasswordRule[];
  private readonly pool: string;
  private readonly options: PasswordOptions;

  private currentIndex: number;
  private randomBytes: Uint32Array;

  /**
   * @param options Options for the generation of the password.
   * @param batchSize Size of the random cache.
   */
  constructor(options: Partial<PasswordOptions> = {}, private readonly batchSize: number = 32) {
    this.options = this.generateOptions(options);
    this.assertStrictMatchesLength();

    this.pool = this.generatePool();
    this.rules = [];
    this.loadRules();

    this.currentIndex = 0;
    this.randomBytes = new Uint32Array(this.batchSize);
    this.generateNewRandomCache();
  }

  /**
   * Generates a new password based on the options passed to the constructor.
   *
   * @returns Generated password.
   */
  generate(): string {
    const passwordLength = this.options.length;
    const poolLength = this.pool.length;
    let password: string = '';

    for (let i = 0; i < passwordLength; i++) {
      password += this.pool[this.randomNumber(poolLength)];
    }

    if (this.options.strict) {
      const fitsAllRequiredRules = this.rules.every((rule) => rule.test(password));

      if (!fitsAllRequiredRules) {
        return this.generate();
      }
    }

    return password;
  }

  /**
   * @param max Maximum value of the random number generated (exclusive).
   * @returns A random number between 0 (inclusive) and `max` (exclusive).
   */
  private randomNumber(max: number): number {
    return this.getNextRandomValue() % max;
  }

  /**
   * Generates a random number.
   *
   * Uses a small cache internally to speed up future generations.
   * If all numbers in the cache are exhausted a new cache is generated.
   * The size of the cache depends on the `batchSize` of this object.
   *
   * @returns A random number.
   */
  private getNextRandomValue(): number {
    if (this.currentIndex >= this.randomBytes.length) {
      this.generateNewRandomCache();
    }

    return this.randomBytes[this.currentIndex++];
  }

  /**
   * Generates a new random cache.
   *
   * Also resets the `currentIndex` counter back to 0.
   */
  private generateNewRandomCache(): void {
    this.currentIndex = 0;
    this.randomBytes = window.crypto.getRandomValues(this.randomBytes);
  }

  /**
   * Generates the correct options based on the given ones.
   *
   * If necessary default values are used.
   *
   * @param options Options passed to the construtor.
   * @returns Generated options object.
   */
  private generateOptions(options: Partial<PasswordOptions>): PasswordOptions {
    return {
      length: 10,
      lowercase: true,
      uppercase: true,
      numbers: false,
      symbols: false,
      excludeSimilarCharacters: false,
      strict: false,
      ...options,
    };
  }

  /**
   * Loads the rules a generated password of this generator has to conform to.
   */
  private loadRules(): void {
    if (this.options.numbers) {
      this.rules.push(PasswordCharacters.getRule('numbers'));
    }
    if (this.options.lowercase) {
      this.rules.push(PasswordCharacters.getRule('lowercase'));
    }
    if (this.options.uppercase) {
      this.rules.push(PasswordCharacters.getRule('uppercase'));
    }
    if (this.options.symbols) {
      this.rules.push(PasswordCharacters.getRule('symbols'));
    }
  }

  /**
   * @returns Pool of characters according to the given `options`.
   */
  private generatePool(): string {
    let pool: string = '';

    if (this.options.lowercase) {
      pool += PasswordCharacters.LOWER_CASE;
    }
    if (this.options.uppercase) {
      pool += PasswordCharacters.UPPER_CASE;
    }
    if (this.options.numbers) {
      pool += PasswordCharacters.NUMBERS;
    }
    if (this.options.symbols) {
      pool += PasswordCharacters.SYMBOLS;
    }

    if (!pool) {
      throw new Error('You must use at least one of the rules for the character pool.');
    }

    if (this.options.excludeSimilarCharacters) {
      pool = PasswordCharacters.removeSimilarCharacters(pool);
    }

    return pool;
  }

  /**
   * Checks if the option's length is not smaller than a password generated in strict mode (if enabled).
   *
   * **Must only be called after loading the options!**
   *
   * @throws `Error` - If the above is not met.
   */
  private assertStrictMatchesLength(): void {
    if (this.options.strict) {
      const minStrictLength =
        (this.options.lowercase ? 1 : 0) +
        (this.options.numbers ? 1 : 0) +
        (this.options.symbols ? 1 : 0) +
        (this.options.uppercase ? 1 : 0);

      if (minStrictLength >= this.options.length) {
        throw new Error(
          `Length of the options must be at least ${minStrictLength} due to the strict option being enabled`
        );
      }
    }
  }
}

interface PasswordOptions {
  /**
   * Length of the generated password.
   * @default 10
   */
  length: number;
  /**
   * Should the password include numbers
   * @default false
   */
  numbers: boolean;
  /**
   * Should the password include symbols
   * @default false
   */
  symbols: boolean;
  /**
   * Should the password include lowercase characters
   * @default true
   */
  lowercase: boolean;
  /**
   * Should the password include uppercase characters
   * @default true
   */
  uppercase: boolean;
  /**
   * Should exclude visually similar characters like 'i' and 'I'
   * @default false
   */
  excludeSimilarCharacters: boolean;
  /**
   * Password should include at least one character from each pool
   * @default false
   */
  strict: boolean;
}
