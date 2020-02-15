import { NoFunctions } from '../NoFunctions';

export type TestDocument<M> = NoFunctions<M> & { id: string };
