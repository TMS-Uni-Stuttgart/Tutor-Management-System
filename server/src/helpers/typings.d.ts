import { Scheincriteria } from '../model/scheincriteria/Scheincriteria';
import { Typegoose } from '@typegoose/typegoose';

type FunctionKeys<T> = { [P in keyof T]: T[P] extends Function ? P : never }[keyof T];

export type NoFunctions<T> = Omit<T, FunctionKeys<T>>;

export type TypegooseDocument<T> = NoFunctions<Omit<T, keyof Typegoose>>;

export type CleanCriteriaShape<T, U = Scheincriteria> = NoFunctions<
  Omit<T, keyof U | 'identifier'>
>;
