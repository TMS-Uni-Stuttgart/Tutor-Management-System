import * as Yup from 'yup';
import { Role } from '../model/Role';
import { CreateUserDTO } from '../model/User';

interface ValidationErrorExtract {
  path: string;
  message: string;
}

export type ValidationErrors = ValidationErrorExtract[];

interface ValidationErrorsWrapper {
  errors: ValidationErrors;
}

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
  try {
    const result: Yup.Shape<object, CreateUserDTO> = CreateUserDTOSchema.validateSync(obj, {
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
