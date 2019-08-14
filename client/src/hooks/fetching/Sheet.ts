import axios from './Axios';
import { Sheet } from '../../typings/RatingModel';
import { SheetDTO } from '../../typings/RequestDTOs';

export async function getAllSheets(): Promise<Sheet[]> {
  const response = await axios.get<Sheet[]>('sheet');

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function createSheet(sheetInfo: SheetDTO): Promise<Sheet> {
  const response = await axios.post<Sheet>('sheet', sheetInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function editSheet(id: string, sheetInfo: SheetDTO): Promise<Sheet> {
  const response = await axios.patch<Sheet>(`sheet/${id}`, sheetInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function deleteSheet(id: string): Promise<void> {
  const response = await axios.delete(`sheet/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}
