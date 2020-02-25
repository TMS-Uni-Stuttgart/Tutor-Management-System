import * as Yup from 'yup';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { Role } from '../model/Role';
import { ICreateUserDTO, IUserDTO } from '../model/User';
import { validateSchema } from './helper';
import { TutorialIdListSchema } from './Tutorial';

const UserDTOSchema = Yup.object().shape<IUserDTO>({
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  email: Yup.string()
    .email()
    .required(),
  roles: Yup.array<Role>().required(),
  username: Yup.string().required(),
  tutorials: TutorialIdListSchema,
  tutorialsToCorrect: TutorialIdListSchema,
});

const CreateUserDTOSchema = Yup.object().shape<ICreateUserDTO>({
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  email: Yup.string()
    .email()
    .required(),
  username: Yup.string().required(),
  password: Yup.string().required(),
  roles: Yup.array<Role>().required(),
  tutorials: TutorialIdListSchema,
  tutorialsToCorrect: TutorialIdListSchema,
});

export function validateAgainstCreateUserDTO(
  obj: any
): Yup.Shape<object, ICreateUserDTO> | ValidationErrorsWrapper {
  return validateSchema(CreateUserDTOSchema, obj);
}

export function validateAgainstUserDTO(
  obj: any
): Yup.Shape<object, IUserDTO> | ValidationErrorsWrapper {
  return validateSchema(UserDTOSchema, obj);
}
