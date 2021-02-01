import { IScheinCriteriaDTO } from '../../shared/model/ScheinCriteria';
import { IsDefined, IsString } from 'class-validator';

export class ScheinCriteriaDTO implements IScheinCriteriaDTO {
    @IsString()
    name!: string;

    @IsString()
    identifier!: string;

    @IsDefined()
    data: any;
}
