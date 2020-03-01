import { IsString, validateSync } from 'class-validator';
import { ScheinexamDocument } from '../../../database/models/scheinexam.model';
import { SheetDocument } from '../../../database/models/sheet.model';
import { StudentDocument } from '../../../database/models/student.model';
import { CriteriaInformation, ScheinCriteriaStatus } from '../../../shared/model/ScheinCriteria';
import { ScheinCriteriaDTO } from '../scheincriteria.dto';
import { ScheincriteriaContainer } from './scheincriteria.container';
import { BadRequestException } from '@nestjs/common';

export interface CriteriaPayload {
  student: StudentDocument;
  sheets: SheetDocument[];
  exams: ScheinexamDocument[];
}

export interface InformationPayload {
  students: StudentDocument[];
  sheets: SheetDocument[];
  exams: ScheinexamDocument[];
}

export type StatusCheckResponse = Omit<ScheinCriteriaStatus, 'id' | 'name'>;
export type CriteriaInformationWithoutName = Omit<CriteriaInformation, 'name' | 'studentSummaries'>;

export abstract class Scheincriteria {
  @IsString()
  readonly identifier: string;

  constructor(identifier: string) {
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

    // Get the constructor of the blueprint. The type needs to be set here because 'constructor' is only typed as 'Function' and therefore cannot be used with 'new' in front of it.
    const prototype = bluePrintData.blueprint.constructor as new () => Scheincriteria;
    const criteria: Scheincriteria = Object.assign(new prototype(), data);

    const errors = validateSync(criteria, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return criteria;
  }

  abstract checkCriteriaStatus(payload: CriteriaPayload): StatusCheckResponse;

  abstract getInformation(payload: InformationPayload): CriteriaInformationWithoutName;
}
