import axios from './Axios';

export async function getVersionOfApp(): Promise<string> {
  const response = await axios.get<string>(`information/version`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getHandbookUrl(): Promise<string> {
  const response = await axios.get<string>(`information/handbook-url`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}
