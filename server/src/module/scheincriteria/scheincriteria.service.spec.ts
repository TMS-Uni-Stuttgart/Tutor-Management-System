import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import {
  MockedScheincriteriaModel,
  SCHEINCRITERIA_DOCUMENTS,
} from '../../../test/mocks/documents.mock';
import { ScheincriteriaIdentifier, IScheinCriteria } from '../../shared/model/ScheinCriteria';
import { AttendanceCriteria } from './container/criterias/AttendanceCriteria';
import { PresentationCriteria } from './container/criterias/PresentationCriteria';
import { ScheinexamCriteria } from './container/criterias/ScheinexamCriteria';
import { SheetIndividualCriteria } from './container/criterias/SheetIndividualCriteria';
import { SheetTotalCriteria } from './container/criterias/SheetTotalCriteria';
import { ScheincriteriaContainer } from './container/scheincriteria.container';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { ScheincriteriaConstructor } from './scheincriteria.module';
import { ScheincriteriaService } from './scheincriteria.service';
import { StudentService } from '../student/student.service';
import { SheetService } from '../sheet/sheet.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { TeamService } from '../team/team.service';
import { UserService } from '../user/user.service';
import { ScheincriteriaClass } from './container/scheincriteria.form';

interface AssertScheincriteriaParams {
  expected: MockedScheincriteriaModel;
  actual: IScheinCriteria;
}

interface AssertScheincriteriaListParams {
  expected: MockedScheincriteriaModel[];
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
    _id,
    name,
    criteria: { identifier, ...data },
  } = expected;
  const { id, identifier: actualIdentifier, data: actualData, name: actualName } = actual;

  expect(id).toEqual(_id);
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

  for (let i = 0; i < actual.length; i++) {
    assertScheincriteria({ expected: expected[i], actual: actual[i] });
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

  criterias.forEach(criteria => registerCriteria(criteria));
}

function registerCriteria(criteriaClass: ScheincriteriaClass) {
  ScheincriteriaContainer.getContainer().registerBluePrint(criteriaClass);
}

describe('ScheincriteriaService', () => {
  let testModule: TestingModule;
  let service: ScheincriteriaService;

  beforeAll(async () => {
    registerAllCriterias();

    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [
        ScheincriteriaService,
        StudentService,
        SheetService,
        ScheinexamService,
        TutorialService,
        TeamService,
        UserService,
      ],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<ScheincriteriaService>(ScheincriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('get all criterias', async () => {
    const criterias = await service.findAll();

    assertScheincriteriaList({
      expected: SCHEINCRITERIA_DOCUMENTS,
      actual: criterias.map(criteria => criteria.toDTO()),
    });
  });

  it('find criteria by id', async () => {
    const expected = SCHEINCRITERIA_DOCUMENTS[0];
    const actual = await service.findById(expected._id);

    assertScheincriteria({ expected, actual: actual.toDTO() });
  });

  it('fail on finding a non-existing criteria', async () => {
    const nonExisting = generateObjectId();

    await expect(service.findById(nonExisting)).rejects.toThrow(NotFoundException);
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

    const criteria = await service.create(dto);

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

    const criteria = await service.create(dto);

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

    const criteria = await service.create(dto);

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

    const criteria = await service.create(dto);

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

    const criteria = await service.create(dto);

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

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('fail on creating attendance criteria with additional properties', async () => {
    const dto: ScheinCriteriaDTO = {
      name: 'Attendance criteria',
      identifier: ScheincriteriaIdentifier.ATTENDANCE,
      data: {
        percentage: true,
        valueNeeded: 0.5,
        notInCriteria: 'definitlyNotInCriteria',
      },
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
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

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
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

    const oldCriteria = await service.create(createDTO);
    const updatedCriteria = await service.update(oldCriteria.id, updateDTO);

    assertScheincriteriaDTO({ expected: updateDTO, actual: updatedCriteria });
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

    const oldCriteria = await service.create(createDTO);
    await expect(service.update(oldCriteria.id, updateDTO)).rejects.toThrow(BadRequestException);
  });

  it('fail on updating attendance criteria with additional properties', async () => {
    const updateDTO: ScheinCriteriaDTO = {
      name: 'Attendance criteria',
      identifier: ScheincriteriaIdentifier.ATTENDANCE,
      data: {
        percentage: true,
        valueNeeded: 0.5,
        notInCriteria: 'definitly not in criteria',
      },
    };
    const createDTO: ScheinCriteriaDTO = {
      ...updateDTO,
      data: {
        percentage: true,
        valueNeeded: 0.5,
      },
    };

    const oldCriteria = await service.create(createDTO);
    await expect(service.update(oldCriteria.id, updateDTO)).rejects.toThrow(BadRequestException);
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

    const oldCriteria = await service.create(createDTO);
    await expect(service.update(oldCriteria.id, updateDTO)).rejects.toThrow(BadRequestException);
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

    const nonExisting = generateObjectId();
    await expect(service.update(nonExisting, updateDTO)).rejects.toThrow(NotFoundException);
  });

  it('delete a criteria', async () => {
    const dto: ScheinCriteriaDTO = {
      name: 'Test criteria',
      identifier: ScheincriteriaIdentifier.PRESENTATION,
      data: {
        presentationsNeeded: 4,
      },
    };

    const criteria = await service.create(dto);
    const deletedCriteria = await service.delete(criteria.id);

    expect(deletedCriteria.id).toEqual(criteria.id);
    await expect(service.findById(criteria.id)).rejects.toThrow(NotFoundException);
  });

  it('fail on deleting non-existing criteria', async () => {
    const nonExisting = generateObjectId();

    await expect(service.delete(nonExisting)).rejects.toThrow(NotFoundException);
  });
});
