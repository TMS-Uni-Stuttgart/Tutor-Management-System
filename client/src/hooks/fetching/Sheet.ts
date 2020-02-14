import axios from './Axios';
import { Sheet, SheetDTO } from 'shared/model/Sheet';

export async function getAllSheets(): Promise<Sheet[]> {
  const response = await axios.get<Sheet[]>('sheet');

  if (response.status === 200) {
    return response.data.sort((a, b) => a.sheetNo - b.sheetNo);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getSheet(sheetId: string): Promise<Sheet> {
  const response = await axios.get<Sheet>(`sheet/${sheetId}`);

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
