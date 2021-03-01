import axios from './Axios';
import { ISheet, ISheetDTO } from 'shared/model/Sheet';
import { Sheet } from '../../model/Sheet';
import { plainToClass } from 'class-transformer';

export async function getAllSheets(): Promise<Sheet[]> {
  const response = await axios.get<ISheet[]>('sheet');

  if (response.status === 200) {
    const data = plainToClass(Sheet, response.data);
    return data.sort((a, b) => a.sheetNo - b.sheetNo);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getSheet(sheetId: string): Promise<Sheet> {
  const response = await axios.get<ISheet>(`sheet/${sheetId}`);

  if (response.status === 200) {
    return plainToClass(Sheet, response.data);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function createSheet(sheetInfo: ISheetDTO): Promise<Sheet> {
  const response = await axios.post<ISheet>('sheet', sheetInfo);

  if (response.status === 201) {
    return plainToClass(Sheet, response.data);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function editSheet(id: string, sheetInfo: ISheetDTO): Promise<Sheet> {
  const response = await axios.patch<ISheet>(`sheet/${id}`, sheetInfo);

  if (response.status === 200) {
    return plainToClass(Sheet, response.data);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function deleteSheet(id: string): Promise<void> {
  const response = await axios.delete(`sheet/${id}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}
