import * as Yup from 'yup';
import { TeamDTO } from '../model/Team';
import { validateSchema, YupIdShape } from './helper';
import { ValidationErrorsWrapper } from '../model/errors/Errors';

const TeamDTOSchema = Yup.object().shape<TeamDTO>({
  students: Yup.array<string>().of(YupIdShape),
});

export function validateAgainstTeamDTO(
  obj: any
): Yup.Shape<object, TeamDTO> | ValidationErrorsWrapper {
  return validateSchema(TeamDTOSchema, obj);
}
