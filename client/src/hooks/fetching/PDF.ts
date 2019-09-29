import axios from './Axios';

export async function getAttendancePDF(tutorialId: string, date: string): Promise<Blob> {
  const response = await axios.get(`pdf/attendance/${tutorialId}/${date}`);
  console.log(response);

  if (response.status === 200) {
    return new Blob(response.data, { type: 'application/pdf' });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}
