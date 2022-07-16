import { PasswordRule } from './PasswordRule';

export abstract class PasswordCharacters {
  static readonly LOWER_CASE: string = 'abcdefghijklmnopqrstuvwxyz';
  static readonly UPPER_CASE: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static readonly NUMBERS: string = '0123456789';
  static readonly SYMBOLS: string = '!@#$%^&*()+_-=}{[]|:;"/?.><,`~';

  private static readonly SIMILAR_CHARACTERS: RegExp = /[ilLI|`oO0]/g;
  private static readonly STRICT_RULES: ReadonlyMap<string, PasswordRule> = new Map([
    ['lowercase', new PasswordRule('lowercase', /[a-z]/)],
    ['uppercase', new PasswordRule('uppercase', /[A-Z]/)],
    ['numbers', new PasswordRule('numbers', /[0-9]/)],
    ['symbols', new PasswordRule('symbols', /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/)],
  ]);

  static getRule(name: string): PasswordRule {
    const rule = PasswordCharacters.STRICT_RULES.get(name);

    if (!rule) {
      throw new Error(`There is no rule with the given name "${name}"`);
    }

    return rule;
  }

  /**
   * @param pool Pool to remove the similar characters from.
   * @returns New pool but without the similar characters.
   */
  static removeSimilarCharacters(pool: string): string {
    return pool.replace(PasswordCharacters.SIMILAR_CHARACTERS, '');
  }
}
