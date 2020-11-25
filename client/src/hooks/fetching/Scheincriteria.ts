import {
  CriteriaInformation,
  IScheinCriteriaDTO,
  IScheinCriteria,
  ScheincriteriaSummaryByStudents,
  ScheinCriteriaSummary,
} from 'shared/model/ScheinCriteria';
import { FormDataResponse } from '../../components/generatedForm/types/FieldData';
import axios from './Axios';

export async function getAllScheinCriterias(): Promise<IScheinCriteria[]> {
  const response = await axios.get<IScheinCriteria[]>('scheincriteria');

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getScheincriteriaInformation(
  criteriaId: string
): Promise<CriteriaInformation> {
  const response = await axios.get<CriteriaInformation>(`scheincriteria/${criteriaId}/info`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getScheinCriteriaFormData(): Promise<FormDataResponse> {
  const response = await axios.get<FormDataResponse>('scheincriteria/form');

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createScheinCriteria(
  criteriaInfo: IScheinCriteriaDTO
): Promise<IScheinCriteria> {
  const response = await axios.post<IScheinCriteria>('scheincriteria', criteriaInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editScheinCriteria(
  id: string,
  criteriaInfo: IScheinCriteriaDTO
): Promise<IScheinCriteria> {
  const response = await axios.patch<IScheinCriteria>(`/scheincriteria/${id}`, criteriaInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function deleteScheinCriteria(id: string): Promise<void> {
  const response = await axios.delete(`/scheincriteria/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function getScheinCriteriaSummariesOfAllStudentsOfTutorial(
  id: string
): Promise<ScheincriteriaSummaryByStudents> {
  const response = await axios.get<ScheincriteriaSummaryByStudents>(
    `scheincriteria/tutorial/${id}`
  );

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getScheinCriteriaSummaryOfStudent(
  studentId: string
): Promise<ScheinCriteriaSummary> {
  const response = await axios.get<ScheinCriteriaSummary>(`/scheincriteria/student/${studentId}`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getScheinCriteriaSummaryOfAllStudents(): Promise<ScheincriteriaSummaryByStudents> {
  const response = await axios.get<ScheincriteriaSummaryByStudents>(`/scheincriteria/student`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}
