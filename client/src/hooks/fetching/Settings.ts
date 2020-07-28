import { IClientSettings } from 'shared/model/Settings';
import axios from './Axios';

export async function getSettings(): Promise<IClientSettings> {
  const response = await axios.get<IClientSettings>(`setting`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}
