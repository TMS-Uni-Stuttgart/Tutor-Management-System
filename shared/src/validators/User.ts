import * as Yup from 'yup';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { Role } from '../model/Role';
import { CreateUserDTO, UserDTO } from '../model/User';
import { validateSchema } from './helper';

const UserDTOSchema = Yup.object().shape<UserDTO>({
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  roles: Yup.array<Role>().required(),
  tutorials: Yup.array()
    .required()
    .of(Yup.string()),
});

const CreateUserDTOSchema = Yup.object().shape<CreateUserDTO>({
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  username: Yup.string().required(),
  password: Yup.string().required(),
  roles: Yup.array<Role>().required(),
  tutorials: Yup.array()
    .required()
    .of(Yup.string()),
});

export function validateAgainstCreateUserDTO(
  obj: any
): Yup.Shape<object, CreateUserDTO> | ValidationErrorsWrapper {
  return validateSchema(CreateUserDTOSchema, obj);
}

export function validateAgainstUserDTO(
  obj: any
): Yup.Shape<object, UserDTO> | ValidationErrorsWrapper {
  return validateSchema(UserDTOSchema, obj);
}
