import { NoFunctions } from '../../src/helpers/NoFunctions';

export type TestDocument<M> = NoFunctions<M> & { id: string };
export type MockedModel<M> = NoFunctions<Omit<M, '_id'>> & { _id: string };
