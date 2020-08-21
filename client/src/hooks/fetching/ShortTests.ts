import { plainToClass } from 'class-transformer';
import { IShortTest, IShortTestDTO } from 'shared/model/ShortTest';
import { ShortTest } from '../../model/ShortTest';
import axios from './Axios';

export async function getAllShortTests(): Promise<ShortTest[]> {
  const response = await axios.get<IShortTest[]>('short-test');

  if (response.status === 200) {
    const data = plainToClass(ShortTest, response.data);
    return data.sort((a, b) => a.shortTestNo - b.shortTestNo);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getShortTest(id: string): Promise<ShortTest> {
  const response = await axios.get<IShortTest>(`short-test/${id}`);

  if (response.status === 200) {
    return plainToClass(ShortTest, response.data);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function createShortTest(dto: IShortTestDTO): Promise<ShortTest> {
  const response = await axios.post<IShortTest>('short-test', dto);

  if (response.status === 201) {
    return plainToClass(ShortTest, response.data);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function editShortTest(shortTestId: string, dto: IShortTestDTO): Promise<ShortTest> {
  const response = await axios.patch<IShortTest>(`short-test/${shortTestId}`, dto);

  if (response.status === 200) {
    return plainToClass(ShortTest, response.data);
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function deleteShortTest(shortTestId: string): Promise<void> {
  const response = await axios.delete(`short-test/${shortTestId}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}
