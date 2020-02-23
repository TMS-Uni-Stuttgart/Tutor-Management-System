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

interface AssertStudentDTOParams {
  expected: StudentDTO;
  actual: Student;

  oldStudent?: Student;
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

function assertStudentDTO({ expected, actual, oldStudent }: AssertStudentDTOParams) {
  const { tutorial, ...restExpected } = expected;
  const {
    id,
    attendances,
    gradings,
    tutorial: actualTutorial,
    presentationPoints, // TODO: Compare me after the model has the presentation points.
    cakeCount,
    ...restActual
  } = actual;

  expect(id).toBeDefined();
  expect(restActual).toEqual(restExpected);

  expect(attendances).toEqual([]);
  expect(gradings).toEqual([]);

  expect(actualTutorial.id).toEqual(tutorial);
  // expect(actualTutorial.slot).toEqual(expectedTutorial.slot);

  if (!!oldStudent) {
    expect(attendances).toEqual(oldStudent.attendances);
    expect(gradings).toEqual(oldStudent.gradings);
    expect(cakeCount).toEqual(oldStudent.cakeCount);
  } else {
    expect(attendances).toEqual([]);
    expect(gradings).toEqual([]);
    expect(cakeCount).toBe(0);
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

    assertStudentDTO({ expected: dto, actual: created });
  });

  it.todo('create a student with a team');

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

  it('get a student with a specific ID', async () => {
    const expected = STUDENT_DOCUMENTS[0];
    const actual = await service.findById(expected._id);

    assertStudent({ expected, actual: actual.toDTO() });
  });

  it('fail on getting a non-existing student', async () => {
    const nonExisting = generateObjectId();

    await expect(service.findById(nonExisting)).rejects.toThrow(NotFoundException);
  });

  it('update student with basic information', async () => {
    const expectedTutorial = TUTORIAL_DOCUMENTS[0];
    const updateDTO: StudentDTO = {
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: expectedTutorial._id,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'weasley_ginny@hogwarts.com',
      matriculationNo: '4567123',
      team: undefined,
    };
    const createDTO: StudentDTO = {
      firstname: 'Harry',
      lastname: 'Potter',
      status: StudentStatus.INACTIVE,
      tutorial: expectedTutorial._id,
      courseOfStudies: 'Data science',
      email: 'potter_harry@hogwarts.com',
      matriculationNo: '5678912',
      team: undefined,
    };

    const oldStudent = await service.create(createDTO);
    const updatedStudent = await service.update(oldStudent.id, updateDTO);

    assertStudentDTO({ expected: updateDTO, actual: updatedStudent, oldStudent });
  });

  it('update student with new tutorial', async () => {
    const expectedTutorial = TUTORIAL_DOCUMENTS[0];
    const otherTutorial = TUTORIAL_DOCUMENTS[1];

    const updateDTO: StudentDTO = {
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: expectedTutorial._id,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'weasley_ginny@hogwarts.com',
      matriculationNo: '4567123',
      team: undefined,
    };
    const createDTO: StudentDTO = {
      ...updateDTO,
      tutorial: otherTutorial._id,
    };

    const oldStudent = await service.create(createDTO);
    const updatedStudent = await service.update(oldStudent.id, updateDTO);

    assertStudentDTO({ expected: updateDTO, actual: updatedStudent, oldStudent });
  });

  it('fail on updating a non-existing student', async () => {
    const nonExisting = generateObjectId();
    const updateDTO: StudentDTO = {
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: TUTORIAL_DOCUMENTS[0]._id,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'weasley_ginny@hogwarts.com',
      matriculationNo: '4567123',
      team: undefined,
    };

    await expect(service.update(nonExisting, updateDTO)).rejects.toThrow(NotFoundException);
  });

  it('fail on updating a student with non-existing tutorial', async () => {
    const expectedTutorial = TUTORIAL_DOCUMENTS[0];
    const nonExisting = generateObjectId();

    const updateDTO: StudentDTO = {
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: nonExisting,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'weasley_ginny@hogwarts.com',
      matriculationNo: '4567123',
      team: undefined,
    };
    const createDTO: StudentDTO = {
      ...updateDTO,
      tutorial: expectedTutorial._id,
    };

    const oldStudent = await service.create(createDTO);

    await expect(service.update(oldStudent.id, updateDTO)).rejects.toThrow(NotFoundException);
  });

  it('delete a student', async () => {
    const expectedTutorial = TUTORIAL_DOCUMENTS[0];
    const dto: StudentDTO = {
      firstname: 'Ginny',
      lastname: 'Weasley',
      status: StudentStatus.ACTIVE,
      tutorial: expectedTutorial._id,
      courseOfStudies: 'Computer science B. Sc.',
      email: 'weasley_ginny@hogwarts.com',
      matriculationNo: '4567123',
      team: undefined,
    };

    const student = await service.create(dto);
    const deletedStudent = await service.delete(student.id);

    expect(deletedStudent.id).toEqual(student.id);
    await expect(service.findById(student.id)).rejects.toThrow(NotFoundException);
  });

  it('fail on deleting a non-existing student', async () => {
    const nonExisting = generateObjectId();

    await expect(service.delete(nonExisting)).rejects.toThrow(NotFoundException);
  });
});
