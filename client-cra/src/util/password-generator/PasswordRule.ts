/**
 * Simple rule a password has to match.
 */
export class PasswordRule {
  /**
   * @param name Name of this rule.
   * @param rule RegExp which a password has to conform to.
   */
  constructor(readonly name: string, private readonly rule: RegExp) {}

  /**
   * @param password Password to test
   * @returns True, if the password matches this rule.
   */
  test(password: string): boolean {
    return this.rule.test(password);
  }
}
