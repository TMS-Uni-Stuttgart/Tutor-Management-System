import { IScheinExam, IScheinexamDTO } from 'shared/model/Scheinexam';
import axios from './Axios';
import { Scheinexam } from '../../model/Scheinexam';
import { plainToClass } from 'class-transformer';

export async function getAllScheinExams(): Promise<Scheinexam[]> {
  const response = await axios.get<IScheinExam[]>(`scheinexam`);

  if (response.status === 200) {
    const data = plainToClass(Scheinexam, response.data);
    return data.sort((a, b) => a.scheinExamNo - b.scheinExamNo);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getScheinexam(examId: string): Promise<Scheinexam> {
  const response = await axios.get<IScheinExam>(`scheinexam/${examId}`);

  if (response.status === 200) {
    return plainToClass(Scheinexam, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createScheinExam(exam: IScheinexamDTO): Promise<Scheinexam> {
  const response = await axios.post<IScheinExam>(`scheinexam`, exam);

  if (response.status === 201) {
    return plainToClass(Scheinexam, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editScheinExam(examId: string, exam: IScheinexamDTO): Promise<Scheinexam> {
  const response = await axios.patch<IScheinExam>(`scheinexam/${examId}`, exam);

  if (response.status === 200) {
    return plainToClass(Scheinexam, response.data);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function deleteScheinExam(examId: string): Promise<void> {
  const response = await axios.delete(`scheinexam/${examId}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}
