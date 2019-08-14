import {
  AttendanceDTO,
  PresentationPointsDTO,
  StudentDTO,
  UpdatePointsDTO,
} from '../typings/RequestDTOs';
import { Attendance, ScheinCriteriaSummary, Student, Team } from '../typings/ServerResponses';
import { StudentWithFetchedTeam, StudentByTutorialSlotSummaryMap } from '../typings/types';
import axios from './Axios';
import { getAllTutorials } from './Tutorial';

async function getAllStudents(): Promise<Student[]> {
  const response = await axios.get<Student[]>('student');

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getStudent(studentId: string): Promise<Student> {
  const response = await axios.get<Student>(`student/${studentId}`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getAllStudentsAndFetchTeams(): Promise<StudentWithFetchedTeam[]> {
  const students = await getAllStudents();

  return fetchTeamsOfStudents(students);
}

export async function createStudent(studentInfo: StudentDTO): Promise<Student> {
  const response = await axios.post<Student>('student', studentInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createStudentAndFetchTeam(
  studentInfo: StudentDTO
): Promise<StudentWithFetchedTeam> {
  const student = await createStudent(studentInfo);

  return fetchTeamOfStudent(student);
}

export async function editStudent(id: string, studentInfo: StudentDTO): Promise<Student> {
  const response = await axios.patch<Student>(`student/${id}`, studentInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editStudentAndFetchTeam(
  id: string,
  studentInfo: StudentDTO
): Promise<StudentWithFetchedTeam> {
  const student = await editStudent(id, studentInfo);

  return fetchTeamOfStudent(student);
}

export async function deleteStudent(id: string): Promise<void> {
  const response = await axios.delete(`student/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function setAttendanceOfStudent(
  id: string,
  attendanceInfo: AttendanceDTO
): Promise<Attendance> {
  const response = await axios.put<Attendance>(`student/${id}/attendance`, attendanceInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function setPointsOfStudent(
  studentId: string,
  points: UpdatePointsDTO
): Promise<void> {
  const response = await axios.put(`student/${studentId}/points`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}

export async function setPresentationPointsOfStudent(
  studentId: string,
  points: PresentationPointsDTO
): Promise<void> {
  const response = await axios.put(`student/${studentId}/presentation`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}

export async function setExamPointsOfStudent(studentId: string, points: UpdatePointsDTO) {
  const response = await axios.put(`student/${studentId}/examresult`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function getTeamOfStudent(id: string): Promise<Team | undefined> {
  const response = await axios.get<Team | undefined>(`student/${id}/team`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function fetchTeamOfStudent(student: Student): Promise<StudentWithFetchedTeam> {
  const team = await getTeamOfStudent(student.id);

  return { ...student, team };
}

export async function fetchTeamsOfStudents(students: Student[]): Promise<StudentWithFetchedTeam[]> {
  const promises: Promise<StudentWithFetchedTeam>[] = [];

  for (const student of students) {
    promises.push(getTeamOfStudent(student.id).then(team => ({ ...student, team })));
  }

  return Promise.all(promises);
}

export async function getScheinCriteriaSummaryOfStudent(
  studentId: string
): Promise<ScheinCriteriaSummary> {
  const response = await axios.get<ScheinCriteriaSummary>(`/student/${studentId}/scheincriteria`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getScheinCriteriaSummariesOfAllStudents(): Promise<{
  [studentId: string]: ScheinCriteriaSummary;
}> {
  const students = await getAllStudents();
  const criteriaResponses: Promise<[string, ScheinCriteriaSummary]>[] = [];

  students.forEach(student => {
    criteriaResponses.push(
      new Promise<[string, ScheinCriteriaSummary]>(async resolve => {
        const id = student.id;
        const result = await getScheinCriteriaSummaryOfStudent(id);

        resolve([id, result]);
      })
    );
  });

  const allSummaries: [string, ScheinCriteriaSummary][] = await Promise.all(criteriaResponses);

  const criterias: { [studentId: string]: ScheinCriteriaSummary } = {};

  allSummaries.forEach(([studentId, summary]) => (criterias[studentId] = summary));

  return criterias;
}

export async function getScheinCriteriaSummariesOfAllStudentsWithTutorialSlots(): Promise<
  StudentByTutorialSlotSummaryMap
> {
  const students = await getAllStudents();
  const tutorials = await getAllTutorials();
  const allSummaries = await getScheinCriteriaSummariesOfAllStudents();

  const result: StudentByTutorialSlotSummaryMap = {};

  Object.entries(allSummaries).forEach(([studentId, summary]) => {
    const student = students.find(s => s.id === studentId);

    if (!student) {
      return;
    }

    const tutorial = tutorials.find(t => t.id === student.tutorial);

    if (!tutorial) {
      return;
    }

    const prevSummaries = result[tutorial.slot.toString()] || [];

    result[tutorial.slot.toString()] = [...prevSummaries, summary];
  });

  return result;
}
