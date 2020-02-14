import Chance from 'chance';
import { Student, StudentStatus } from 'shared/dist/model/Student';
import studentService from '../../src/services/student-service/StudentService.class';

interface GenerateSingleStudentParams {
  tutorialId: string;
  team?: string;
}

interface GenerateStudentsParams extends GenerateSingleStudentParams {
  count: number;
}

export async function generateSingleStudent({
  tutorialId,
  team,
}: GenerateSingleStudentParams): Promise<Student> {
  const chance = new Chance();
  const [firstname, lastname] = chance.name().split(' ');
  const email = chance.email();
  const matriculationNo = chance.natural({ min: 1000000, max: 9999999 }).toString();

  return studentService.createStudent({
    tutorial: tutorialId,
    courseOfStudies: 'Computer science',
    firstname,
    lastname,
    email,
    matriculationNo,
    team,
    status: StudentStatus.ACTIVE,
  });
}

export async function generateStudents({
  count,
  tutorialId,
  team,
}: GenerateStudentsParams): Promise<string[]> {
  const students: string[] = [];

  for (let i = 0; i < count; i++) {
    const student = await generateSingleStudent({ tutorialId, team });

    students.push(student.id);
  }

  return students;
}
