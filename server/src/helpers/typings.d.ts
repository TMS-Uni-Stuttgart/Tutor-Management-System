type FunctionKeys<T> = ({ [P in keyof T]: T[P] extends Function ? P : never })[keyof T];

export type NoFunctions<T> = Omit<T, FunctionKeys<T>>;

export type CleanShape<T, U> = NoFunctions<Omit<T, keyof U>>;
