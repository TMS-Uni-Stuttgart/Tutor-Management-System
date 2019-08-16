import * as Yup from 'yup';
import { Role } from '../model/Role';
import { CreateUserDTO, UserDTO } from '../model/User';

interface ValidationErrorExtract {
  path: string;
  message: string;
}

export type ValidationErrors = ValidationErrorExtract[];

interface ValidationErrorsWrapper {
  errors: ValidationErrors;
}

const UserDTOSchema = Yup.object().shape<UserDTO>({
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  roles: Yup.array<Role>(),
  tutorials: Yup.array().of(Yup.string()),
});

const CreateUserDTOSchema = Yup.object().shape<CreateUserDTO>({
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  username: Yup.string().required(),
  password: Yup.string().required(),
  roles: Yup.array<Role>(),
  tutorials: Yup.array().of(Yup.string()),
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

function validateSchema<T extends object>(
  schema: Yup.Schema<T>,
  obj: any
): Yup.Shape<object, T> | ValidationErrorsWrapper {
  try {
    const result: Yup.Shape<object, T> = schema.validateSync(obj, {
      abortEarly: false,
    });
    return result;
  } catch (err) {
    if (!(err instanceof Yup.ValidationError)) {
      throw err;
    }

    return { errors: getErrorExtracts(err) };
  }
}

function getErrorExtracts(err: Yup.ValidationError): ValidationErrorExtract[] {
  const errors: ValidationErrorExtract[] = [];

  err.inner.forEach(({ path, message }) => {
    errors.push({ path, message });
  });

  return errors;
}
