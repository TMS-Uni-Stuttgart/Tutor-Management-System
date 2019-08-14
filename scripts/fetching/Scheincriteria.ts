import axios from './Axios';
import { ScheinCriteria } from '../typings/RatingModel';
import { ScheinCriteriaDTO } from '../typings/RequestDTOs';

export async function getAllScheinCriterias(): Promise<ScheinCriteria[]> {
  const response = await axios.get<ScheinCriteria[]>('scheincriteria');

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createScheinCriteria(
  criteriaInfo: ScheinCriteriaDTO
): Promise<ScheinCriteria> {
  const response = await axios.post<ScheinCriteria>('scheincriteria', criteriaInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editScheinCriteria(
  id: string,
  criteriaInfo: ScheinCriteriaDTO
): Promise<ScheinCriteria> {
  const response = await axios.patch<ScheinCriteria>(`/scheincriteria/${id}`, criteriaInfo);

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
