import { Attendance, IAttendanceDTO } from 'shared/model/Attendance';
import { IGradingDTO, IPresentationPointsDTO } from 'shared/model/Points';
import { ICakeCountDTO, IStudentDTO, Student } from 'shared/model/Student';
import { sortByName } from 'shared/util/helpers';
import axios from './Axios';

export async function getAllStudents(): Promise<Student[]> {
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

export async function createStudent(studentInfo: IStudentDTO): Promise<Student> {
  const response = await axios.post<Student>('student', studentInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editStudent(id: string, studentInfo: IStudentDTO): Promise<Student> {
  const response = await axios.patch<Student>(`student/${id}`, studentInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function deleteStudent(id: string): Promise<void> {
  const response = await axios.delete(`student/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function setAttendanceOfStudent(
  id: string,
  attendanceInfo: IAttendanceDTO
): Promise<Attendance> {
  const response = await axios.put<Attendance>(`student/${id}/attendance`, attendanceInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function setPointsOfStudent(studentId: string, points: IGradingDTO): Promise<void> {
  const response = await axios.put(`student/${studentId}/grading`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}

export async function setPresentationPointsOfStudent(
  studentId: string,
  points: IPresentationPointsDTO
): Promise<void> {
  const response = await axios.put(`student/${studentId}/presentation`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}

export async function setExamPointsOfStudent(studentId: string, points: IGradingDTO) {
  const response = await axios.put(`student/${studentId}/grading`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function setCakeCountForStudent(studentId: string, cakeCountDTO: ICakeCountDTO) {
  const response = await axios.put(`student/${studentId}/cakecount`, cakeCountDTO);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}
