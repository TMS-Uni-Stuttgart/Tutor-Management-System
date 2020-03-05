import { ScheinExam, IScheinExamDTO } from 'shared/model/Scheinexam';
import {
  transformMultipleScheinExamResponse,
  transformScheinExamResponse,
} from '../../util/axiosTransforms';
import axios from './Axios';

export async function getAllScheinExams(): Promise<ScheinExam[]> {
  const response = await axios.get<ScheinExam[]>(`scheinexam`, {
    transformResponse: transformMultipleScheinExamResponse,
  });

  if (response.status === 200) {
    return response.data.sort((a, b) => a.scheinExamNo - b.scheinExamNo);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getScheinexam(examId: string): Promise<ScheinExam> {
  const response = await axios.get<ScheinExam>(`scheinexam/${examId}`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createScheinExam(exam: IScheinExamDTO): Promise<ScheinExam> {
  const response = await axios.post<ScheinExam>(`scheinexam`, exam, {
    transformResponse: transformScheinExamResponse,
  });

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editScheinExam(examId: string, exam: IScheinExamDTO): Promise<ScheinExam> {
  const response = await axios.patch(`scheinexam/${examId}`, exam, {
    transformResponse: transformScheinExamResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function deleteScheinExam(examId: string): Promise<void> {
  const response = await axios.delete(`scheinexam/${examId}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}
