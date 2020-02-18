import { Test, TestingModule } from '@nestjs/testing';
import { MongooseMockModelProvider } from '../../../test/helpers/test.provider';
import { MockedModel } from '../../../test/helpers/testdocument';
import { MockedTutorialService } from '../../../test/mocks/tutorial.service.mock';
import { StudentModel } from '../models/student.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { StudentService } from './student.service';
import { createMockModel } from '../../../test/helpers/test.create-mock-model';
import { TutorialDocument } from '../models/tutorial.model';
import { StudentStatus, Student } from '../../shared/model/Student';
import { StudentDTO } from './student.dto';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { NotFoundException } from '@nestjs/common';

interface AssertStudentParams {
  expected: MockedModel<StudentModel>;
  actual: Student;
}

interface AssertStudentListParams {
  expected: MockedModel<StudentModel>[];
  actual: Student[];
}

const STUDENT_DOCUMENTS: MockedModel<StudentModel>[] = [
  createMockModel(
    new StudentModel({
      firstname: 'Hermine',
      lastname: 'Granger',
      tutorial: MockedTutorialService.getOneDocument() as TutorialDocument,
      status: StudentStatus.NO_SCHEIN_REQUIRED,
      courseOfStudies: 'Software engineering B. Sc.',
      email: 'granger_hermine@hogwarts.com',
      matriculationNo: '2345671',
      cakeCount: 0,
      team: undefined,
      attendances: new Map(),
      gradings: new Map(),
    })
  ),
  createMockModel(
    new StudentModel({
      firstname: 'Harry',
      lastname: 'Potter',
      tutorial: MockedTutorialService.getOneDocument() as TutorialDocument,
      status: StudentStatus.ACTIVE,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'potter_harry@hogwarts.com',
      matriculationNo: '1234567',
      cakeCount: 2,
      team: undefined,
      attendances: new Map(),
      gradings: new Map(),
    })
  ),
  createMockModel(
    new StudentModel({
      firstname: 'Draco',
      lastname: 'Malfoy',
      tutorial: MockedTutorialService.getOneDocument() as TutorialDocument,
      status: StudentStatus.INACTIVE,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'malfoy_draco@hogwarts.com',
      matriculationNo: '3456712',
      cakeCount: 0,
      team: undefined,
      attendances: new Map(),
      gradings: new Map(),
    })
  ),
];

/**
 * Checks if the given student representations are considered equal.
 *
 * Equality is defined as:
 * - The actual `id` matches the expected `_id`.
 * - The actual `tutorial` has the correct `id` and `slot`.
 * - After they are converted back to maps the actual representations of the maps are equal to the expected maps.
 * - All other properties of the actual representation match the properties in the expected one.
 *
 * @param params Must contain an expected StudentDocuemt and the actual Student object.
 */
function assertStudent({ expected, actual }: AssertStudentParams) {
  const { _id, attendances, gradings, tutorial, ...restExpected } = expected;
  const {
    attendances: actualAttendances,
    gradings: actualGradings,
    tutorial: actualTutorial,
    presentationPoints, // TODO: Compare me after the model has the presentation points.
    ...restActual
  } = actual;

  expect(actual.id).toEqual(_id.toString());

  expect(actualTutorial.id).toEqual(tutorial.id);
  expect(actualTutorial.slot).toEqual(tutorial.slot);

  expect(new Map(actualAttendances)).toEqual(attendances);
  expect(new Map(gradings)).toEqual(gradings);

  expect(restActual).toEqual(restExpected);
}

/**
 * Checks if the given actual list of students is equal to the expected one.
 *
 * Equality is defined as:
 * - All actual students are "equal" to their corresponding expected part. Equality is defined by `assertStudent()`.
 * - Both list are in the same order.
 *
 * @param params Must contain a list of expected StudentDocuments and the actual list of Students.
 */
function assertStudentList({ expected, actual }: AssertStudentListParams) {
  expect(actual.length).toBe(expected.length);

  for (let i = 0; i < actual.length; i++) {
    assertStudent({ expected: expected[i], actual: actual[i] });
  }
}

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: TutorialService, useClass: MockedTutorialService },
        MongooseMockModelProvider.create({
          modelClass: StudentModel,
          documents: STUDENT_DOCUMENTS,
        }),
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all students', async () => {
    const students = await service.findAll();

    assertStudentList({ expected: STUDENT_DOCUMENTS, actual: students });
  });

  it('create a student without a team', async () => {
    const expectedTutorial = MockedTutorialService.getOneDocument();

    const dto: StudentDTO = new StudentDTO({
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: expectedTutorial.id,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'weasley_ginny@hogwarts.com',
      matriculationNo: '4567123',
      team: undefined,
    });

    const created = await service.create(dto);

    const { tutorial, ...expected } = dto;
    const {
      id,
      attendances,
      gradings,
      tutorial: actualTutorial,
      presentationPoints, // TODO: Compare me after the model has the presentation points.
      cakeCount,
      ...actual
    } = created;

    expect(id).toBeDefined();
    expect(actual).toEqual(expected);

    expect(attendances).toEqual([]);
    expect(gradings).toEqual([]);

    expect(actualTutorial.id).toEqual(expectedTutorial.id);
    expect(actualTutorial.slot).toEqual(expectedTutorial.slot);

    expect(cakeCount).toBe(0);
  });

  it('fail on creating a student in non-existing tutorial', async () => {
    const nonExistingTutorialId = generateObjectId();

    const dto: StudentDTO = new StudentDTO({
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: nonExistingTutorialId,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'weasley_ginny@hogwarts.com',
      matriculationNo: '4567123',
      team: undefined,
    });

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });
});
