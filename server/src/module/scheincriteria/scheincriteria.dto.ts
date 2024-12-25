import { IsDefined, IsString } from 'class-validator';
import { IScheinCriteriaDTO } from 'shared/model/ScheinCriteria';

export class ScheinCriteriaDTO implements IScheinCriteriaDTO {
    @IsString()
    name!: string;

    @IsString()
    identifier!: string;

    @IsDefined()
    data: any;
}
