import axios from './Axios';
import { FormDataResponse } from '../../components/generatedForm/types/FieldData';
import {
  ScheinCriteriaResponse,
  ScheinCriteriaDTO,
  CriteriaInformation,
} from 'shared/dist/model/ScheinCriteria';

export async function getAllScheinCriterias(): Promise<ScheinCriteriaResponse[]> {
  const response = await axios.get<ScheinCriteriaResponse[]>('scheincriteria');

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
  criteriaInfo: ScheinCriteriaDTO
): Promise<ScheinCriteriaResponse> {
  const response = await axios.post<ScheinCriteriaResponse>('scheincriteria', criteriaInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editScheinCriteria(
  id: string,
  criteriaInfo: ScheinCriteriaDTO
): Promise<ScheinCriteriaResponse> {
  const response = await axios.patch<ScheinCriteriaResponse>(`/scheincriteria/${id}`, criteriaInfo);

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
