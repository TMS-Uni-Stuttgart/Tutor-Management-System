import { NoFunctions } from '../../src/helpers/NoFunctions';

export type TestDocument<M> = NoFunctions<M> & { id: string };

export type MockedModel<M> = M & { _id: string };
