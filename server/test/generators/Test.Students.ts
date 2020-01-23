import Chance from 'chance';
import { Student, StudentStatus } from 'shared/dist/model/Student';
import studentService from '../../src/services/student-service/StudentService.class';

export async function generateSingleStudent(tutorialId: string, team?: string): Promise<Student> {
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

export async function generateStudents(
  count: number,
  tutorialId: string,
  team?: string
): Promise<string[]> {
  const students: string[] = [];

  for (let i = 0; i < count; i++) {
    const student = await generateSingleStudent(tutorialId, team);

    students.push(student.id);
  }

  return students;
}
