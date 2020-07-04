type FunctionKeys<T> = { [P in keyof T]: T[P] extends CallableFunction ? P : never }[keyof T];

export type NoFunctions<T> = Omit<T, FunctionKeys<T>>;
