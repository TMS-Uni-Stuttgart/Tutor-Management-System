export class AssertionError extends Error {
  constructor(readonly expected: any, readonly actual: any) {
    super(`Expected "${expected}" but got\nactual "${actual}"`);
  }
}
