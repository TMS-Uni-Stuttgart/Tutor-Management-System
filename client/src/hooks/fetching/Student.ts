import { Attendance, AttendanceDTO } from 'shared/dist/model/Attendance';
import { UpdatePointsDTO } from 'shared/dist/model/Points';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import {
  CakeCountDTO,
  PresentationPointsDTO,
  Student,
  StudentDTO,
} from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import { sortByName } from 'shared/dist/util/helpers';
import { StudentWithFetchedTeam } from '../../typings/types';
import axios from './Axios';
import { getTeamOfTutorial } from './Team';

async function getAllStudents(): Promise<Student[]> {
  const response = await axios.get<Student[]>('student');

  if (response.status === 200) {
    return response.data.sort(sortByName);
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

export async function setCakeCountForStudent(studentId: string, cakeCountDTO: CakeCountDTO) {
  const response = await axios.put(`student/${studentId}/cakecount`, cakeCountDTO);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function getTeamOfStudent(student: Student): Promise<Team | undefined> {
  if (!student.team) {
    return undefined;
  }

  return getTeamOfTutorial(student.tutorial, student.team);
}

export async function fetchTeamOfStudent(student: Student): Promise<StudentWithFetchedTeam> {
  const team = await getTeamOfStudent(student);

  return { ...student, team };
}

export async function fetchTeamsOfStudents(students: Student[]): Promise<StudentWithFetchedTeam[]> {
  const promises: Promise<StudentWithFetchedTeam>[] = [];

  for (const student of students) {
    promises.push(getTeamOfStudent(student).then(team => ({ ...student, team })));
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

export async function getScheinCriteriaSummaryOfAllStudents(): Promise<{
  [studentId: string]: ScheinCriteriaSummary;
}> {
  const response = await axios.get<{ [studentId: string]: ScheinCriteriaSummary }>(
    `/scheincriteria/student`
  );

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}
