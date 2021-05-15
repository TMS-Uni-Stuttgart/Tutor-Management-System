import { BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { CriteriaInformation, ScheinCriteriaStatus } from 'shared/model/ScheinCriteria';
import { Scheinexam } from '../../../database/entities/scheinexam.entity';
import { Sheet } from '../../../database/entities/sheet.entity';
import { ShortTest } from '../../../database/entities/shorttest.entity';
import { Student } from '../../../database/entities/student.entity';
import { ScheinCriteriaDTO } from '../scheincriteria.dto';
import { ScheincriteriaContainer } from './scheincriteria.container';

export interface CriteriaPayload {
    student: Student;
    sheets: Sheet[];
    exams: Scheinexam[];
    shortTests: ShortTest[];
}

export interface InformationPayload {
    students: Student[];
    sheets: Sheet[];
    exams: Scheinexam[];
    shortTests: ShortTest[];
}

export type StatusCheckResponse = Omit<ScheinCriteriaStatus, 'id' | 'name'>;
export type CriteriaInformationWithoutName = Omit<CriteriaInformation, 'name' | 'studentSummaries'>;

export abstract class Scheincriteria {
    @IsString()
    readonly identifier: string;

    protected constructor(identifier: string) {
        this.identifier = identifier;
    }

    /**
     * Generates a Scheincriteria from the given dto.
     *
     * The returned criteria will be an instance of the class which was saved as blueprint with the given `identifier`. The given `data` will be validated against said class before creating an instancen of it.
     *
     * @param dto DTO containing the information for the criteria.
     *
     * @returns Created scheincriteria from the dto.
     *
     * @throws `NotFoundException` - If no blue print of the given identifier could be found.
     * @throws `BadRequestException` - If the data is not successfully validated against the criteria class to use.
     */
    static fromDTO({ identifier, data }: ScheinCriteriaDTO): Scheincriteria {
        const bluePrintData = ScheincriteriaContainer.getContainer().getBluePrint(identifier);

        const criteria = plainToClass(bluePrintData.blueprint, data);
        const errors = validateSync(criteria, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        return criteria;
    }

    abstract checkCriteriaStatus(payload: CriteriaPayload): StatusCheckResponse;

    abstract getInformation(payload: InformationPayload): CriteriaInformationWithoutName;
}
