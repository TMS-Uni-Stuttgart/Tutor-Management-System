import { Scheincriteria } from '../model/scheincriteria/Scheincriteria';

type FunctionKeys<T> = ({ [P in keyof T]: T[P] extends Function ? P : never })[keyof T];

export type NoFunctions<T> = Omit<T, FunctionKeys<T>>;

export type CleanCriteriaShape<T, U = Scheincriteria> = NoFunctions<
  Omit<T, keyof U | 'identifier'>
>;
