import { plainToClass } from 'class-transformer';
import { IShortTest, IShortTestDTO } from 'shared/model/ShortTest';
import { ShortTest } from '../../model/ShortTest';
import axios from './Axios';

export async function getAllShortTests(): Promise<ShortTest[]> {
  const response = await axios.get<IShortTest[]>('short-test');

  if (response.status === 200) {
    const data = plainToClass(ShortTest, response.data);
    return data.sort((a, b) => a.shortTestNo.localeCompare(b.shortTestNo));
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
