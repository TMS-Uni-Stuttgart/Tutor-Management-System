export class ValueOrError<T> {
  get value(): T {
    if (!!this._value) {
      return this._value;
    } else {
      throw new Error('Value not defined.');
    }
  }

  get error(): string {
    if (!!this._err) {
      return this._err;
    } else {
      throw new Error('Error not defined.');
    }
  }

  constructor(private readonly _value: T | undefined, readonly _err?: string) {}

  hasError(): boolean {
    return !!this._err;
  }
}
