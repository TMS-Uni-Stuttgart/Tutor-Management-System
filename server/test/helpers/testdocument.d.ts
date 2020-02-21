import { NoFunctions } from '../../src/helpers/NoFunctions';

export type TestDocument<M> = NoFunctions<M> & { id: string };
export type MockedModel<M> = NoFunctions<M> & { _id: string };
