import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import { STUDENT_DOCUMENTS, TUTORIAL_DOCUMENTS } from '../../../test/mocks/documents.mock';
import { Student, StudentStatus } from '../../shared/model/Student';
import { StudentModel } from '../../database/models/student.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from '../user/user.service';
import { StudentDTO } from './student.dto';
import { StudentService } from './student.service';

interface AssertStudentParams {
  expected: MockedModel<StudentModel>;
  actual: Student;
}

interface AssertStudentListParams {
  expected: MockedModel<StudentModel>[];
  actual: Student[];
}

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
    id: actualId,
    attendances: actualAttendances,
    gradings: actualGradings,
    tutorial: actualTutorial,
    presentationPoints, // TODO: Compare me after the model has the presentation points.
    ...restActual
  } = actual;

  expect(actualId).toEqual(_id.toString());

  expect(actualTutorial.id).toEqual(tutorial._id);
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
  let testModule: TestingModule;
  let service: StudentService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [StudentService, TutorialService, UserService],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all students', async () => {
    const students = await service.findAll();

    assertStudentList({ expected: STUDENT_DOCUMENTS, actual: students });
  });

  it('create a student without a team', async () => {
    const expectedTutorial = TUTORIAL_DOCUMENTS[0];

    const dto: StudentDTO = new StudentDTO({
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: expectedTutorial._id,
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

    expect(actualTutorial.id).toEqual(expectedTutorial._id);
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
