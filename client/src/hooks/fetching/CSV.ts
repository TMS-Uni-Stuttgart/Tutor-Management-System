import { IParseCsvDTO, ParseCsvResult } from 'shared/model/CSV';
import axios from './Axios';

export async function getParsedCSV<T>(csvDTO: IParseCsvDTO): Promise<ParseCsvResult<T>> {
  const response = await axios.post<ParseCsvResult<T>>('/excel/parseCSV', csvDTO);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}
