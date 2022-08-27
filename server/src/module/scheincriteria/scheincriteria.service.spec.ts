import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IScheinCriteria, ScheincriteriaIdentifier } from 'shared/model/ScheinCriteria';
import { sortListById } from '../../../test/helpers/test.helpers';
import { TestSuite } from '../../../test/helpers/TestSuite';
import { MOCKED_SCHEINCRITERIAS } from '../../../test/mocks/entities.mock';
import { ScheincriteriaEntity } from '../../database/entities/scheincriteria.entity';
import { AttendanceCriteria } from './container/criterias/AttendanceCriteria';
import { PresentationCriteria } from './container/criterias/PresentationCriteria';
import { ScheinexamCriteria } from './container/criterias/ScheinexamCriteria';
import { SheetIndividualCriteria } from './container/criterias/SheetIndividualCriteria';
import { SheetTotalCriteria } from './container/criterias/SheetTotalCriteria';
import { ScheincriteriaContainer } from './container/scheincriteria.container';
import { ScheincriteriaClass } from './container/scheincriteria.form';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { ScheincriteriaConstructor, ScheincriteriaModule } from './scheincriteria.module';
import { ScheincriteriaService } from './scheincriteria.service';

interface AssertScheincriteriaParams {
    expected: ScheincriteriaEntity;
    actual: IScheinCriteria;
}

interface AssertScheincriteriaListParams {
    expected: ScheincriteriaEntity[];
    actual: IScheinCriteria[];
}

interface AssertScheincriteriaDTOParams {
    expected: ScheinCriteriaDTO;
    actual: IScheinCriteria;
}

/**
 * Checks if the actual Scheincriteria matches the expected one.
 *
 * Equality is defined as:
 * -
 *
 * @param params Must contain an actual and an expected Scheincriteria.
 */
function assertScheincriteria({ expected, actual }: AssertScheincriteriaParams) {
    const {
        id,
        name,
        criteria: { identifier, ...data },
    } = expected;
    const {
        id: actualId,
        identifier: actualIdentifier,
        data: actualData,
        name: actualName,
    } = actual;

    expect(actualId).toEqual(id);
    expect(actualName).toEqual(name);
    expect(actualIdentifier).toEqual(identifier);
    expect(actualData).toEqual(data);
}

/**
 * Checks if the actual list of scheincriterias matches the expected one.
 *
 * Equality is defined as:
 * - All elements in the arrays must be equal as defined by {@link assertScheincriteria}.
 *
 * @param params Must contain a list of actual Scheincriterias and expected ScheincriteriaDocuments.
 */
function assertScheincriteriaList({ expected, actual }: AssertScheincriteriaListParams) {
    expect(actual.length).toBe(expected.length);

    const expectedList = sortListById(expected);
    const actualList = sortListById(actual);

    for (let i = 0; i < actual.length; i++) {
        assertScheincriteria({
            expected: expectedList[i],
            actual: actualList[i],
        });
    }
}

/**
 * Checks if the actual scheincriteria matches the expected DTO.
 *
 * Equality is defined by:
 * -
 *
 * @param params Must contain an actual Scheincriteria and the expected ScheincriteriaDTO.
 */
function assertScheincriteriaDTO({ expected, actual }: AssertScheincriteriaDTOParams) {
    const { name, identifier, data } = expected;
    const { id, identifier: actualIdentifier, data: actualData, name: actualName } = actual;

    expect(id).toBeDefined();
    expect(actualIdentifier).toEqual(identifier);
    expect(actualName).toEqual(name);
    expect(actualData).toEqual(data);
}

function registerAllCriterias() {
    const criterias: ScheincriteriaConstructor[] = [
        AttendanceCriteria,
        PresentationCriteria,
        SheetIndividualCriteria,
        SheetTotalCriteria,
        ScheinexamCriteria,
    ];

    criterias.forEach((criteria) => registerCriteria(criteria));
}

function registerCriteria(criteriaClass: ScheincriteriaClass) {
    ScheincriteriaContainer.getContainer().registerBluePrint(criteriaClass);
}

describe('ScheincriteriaService', () => {
    const suite = new TestSuite(ScheincriteriaService, ScheincriteriaModule);

    beforeAll(() => {
        registerAllCriterias();
    });

    it('get all criterias', async () => {
        const criterias = await suite.service.findAll();

        assertScheincriteriaList({
            expected: MOCKED_SCHEINCRITERIAS,
            actual: criterias.map((criteria) => criteria.toDTO()),
        });
    });

    it('find criteria by id', async () => {
        const expected = MOCKED_SCHEINCRITERIAS[0];
        const actual = await suite.service.findById(expected.id);

        assertScheincriteria({ expected, actual: actual.toDTO() });
    });

    it('fail on finding a non-existing criteria', async () => {
        const nonExisting = 'non-existing-id';

        await expect(suite.service.findById(nonExisting)).rejects.toThrow(NotFoundException);
    });

    it('create attendance criteria', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: true,
                valueNeeded: 0.5,
            },
        };

        const criteria = await suite.service.create(dto);

        assertScheincriteriaDTO({ expected: dto, actual: criteria });
    });

    it('create presentation criteria', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Presentation criteria',
            identifier: ScheincriteriaIdentifier.PRESENTATION,
            data: {
                presentationsNeeded: 5,
            },
        };

        const criteria = await suite.service.create(dto);

        assertScheincriteriaDTO({ expected: dto, actual: criteria });
    });

    it('create scheinexam criteria', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Scheinexam criteria',
            identifier: ScheincriteriaIdentifier.SCHEINEXAM,
            data: {
                passAllExamsIndividually: true,
                percentageOfAllPointsNeeded: 0.5,
            },
        };

        const criteria = await suite.service.create(dto);

        assertScheincriteriaDTO({ expected: dto, actual: criteria });
    });

    it('create sheet individual criteria', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Sheet individual criteria',
            identifier: ScheincriteriaIdentifier.SHEET_INDIVIDUAL,
            data: {
                percentage: true,
                valueNeeded: 0.75,
                percentagePerSheet: true,
                valuePerSheetNeeded: 0.5,
            },
        };

        const criteria = await suite.service.create(dto);

        assertScheincriteriaDTO({ expected: dto, actual: criteria });
    });

    it('create sheet total criteria', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Sheet total criteria',
            identifier: ScheincriteriaIdentifier.SHEET_TOTAL,
            data: {
                percentage: true,
                valueNeeded: 0.5,
            },
        };

        const criteria = await suite.service.create(dto);

        assertScheincriteriaDTO({ expected: dto, actual: criteria });
    });

    it('fail on creating attendance criteria with wrong property type', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: 'NOT_A_BOOLEAN',
                valueNeeded: 0.5,
            },
        };

        await expect(suite.service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('fail on creating attendance criteria with additional properties', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: true,
                valueNeeded: 0.5,
                notInCriteria: 'definitelyNotInCriteria',
            },
        };

        await expect(suite.service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('fail on creating attendance criteria with missing properties', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: true,
                // valueNeeded is missing here
            },
        };

        await expect(suite.service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('update attendance criteria', async () => {
        const updateDTO: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: true,
                valueNeeded: 0.5,
            },
        };
        const createDTO: ScheinCriteriaDTO = {
            ...updateDTO,
            data: {
                ...updateDTO.data,
                valueNeeded: 0.3,
            },
        };

        const oldCriteria = await suite.service.create(createDTO);
        const updatedCriteria = await suite.service.update(oldCriteria.id, updateDTO);

        assertScheincriteriaDTO({
            expected: updateDTO,
            actual: updatedCriteria,
        });
    });

    it('fail on updating attendance criteria with wrong property type', async () => {
        const updateDTO: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: 'NOT_A_BOOLEAN',
                valueNeeded: 0.5,
            },
        };
        const createDTO: ScheinCriteriaDTO = {
            ...updateDTO,
            data: {
                ...updateDTO.data,
                percentage: true,
            },
        };

        const oldCriteria = await suite.service.create(createDTO);
        await expect(suite.service.update(oldCriteria.id, updateDTO)).rejects.toThrow(
            BadRequestException
        );
    });

    it('fail on updating attendance criteria with additional properties', async () => {
        const updateDTO: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: true,
                valueNeeded: 0.5,
                notInCriteria: 'definitely not in criteria',
            },
        };
        const createDTO: ScheinCriteriaDTO = {
            ...updateDTO,
            data: {
                percentage: true,
                valueNeeded: 0.5,
            },
        };

        const oldCriteria = await suite.service.create(createDTO);
        await expect(suite.service.update(oldCriteria.id, updateDTO)).rejects.toThrow(
            BadRequestException
        );
    });

    it('fail on updating attendance criteria with missing properties', async () => {
        const updateDTO: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: true,
                // valueNeeded is missing here.
            },
        };
        const createDTO: ScheinCriteriaDTO = {
            ...updateDTO,
            data: {
                ...updateDTO.data,
                valueNeeded: 0.5,
            },
        };

        const oldCriteria = await suite.service.create(createDTO);
        await expect(suite.service.update(oldCriteria.id, updateDTO)).rejects.toThrow(
            BadRequestException
        );
    });

    it('fail on updating a non-existing criteria', async () => {
        const updateDTO: ScheinCriteriaDTO = {
            name: 'Attendance criteria',
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            data: {
                percentage: true,
                valueNeeded: 0.5,
            },
        };

        const nonExisting = 'non-existing-id';
        await expect(suite.service.update(nonExisting, updateDTO)).rejects.toThrow(
            NotFoundException
        );
    });

    it('delete a criteria', async () => {
        const dto: ScheinCriteriaDTO = {
            name: 'Test criteria',
            identifier: ScheincriteriaIdentifier.PRESENTATION,
            data: {
                presentationsNeeded: 4,
            },
        };

        const criteria = await suite.service.create(dto);
        await suite.service.delete(criteria.id);

        await expect(suite.service.findById(criteria.id)).rejects.toThrow(NotFoundException);
    });

    it('fail on deleting non-existing criteria', async () => {
        const nonExisting = 'non-existing-id';

        await expect(suite.service.delete(nonExisting)).rejects.toThrow(NotFoundException);
    });
});
