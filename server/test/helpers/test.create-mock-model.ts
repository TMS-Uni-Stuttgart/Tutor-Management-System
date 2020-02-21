import { generateObjectId } from './test.helpers';
import { UserModel } from '../../src/module/models/user.model';

type MockedModel<M> = M & { _id: string };

export type MockedUserModel = MockedModel<UserModel> & {
  _id: string;
  decryptFieldsSync: () => void;
};

export function createMockModel<M, T extends {}>(model: M): MockedModel<M>;
export function createMockModel<M, T extends {}>(model: M, additional: T): MockedModel<M & T>;
export function createMockModel<M, T extends {}>(
  model: M,
  additional?: T
): MockedModel<M> | MockedModel<M & T> {
  return Object.assign(model, { _id: generateObjectId(), ...additional });
}

export function createUserMockModel(model: UserModel): MockedUserModel {
  return createMockModel(model, { decryptFieldsSync });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function decryptFieldsSync(this: MockedUserModel) {}
