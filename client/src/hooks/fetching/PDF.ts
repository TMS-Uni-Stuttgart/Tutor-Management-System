import axios from './Axios';

export async function getAttendancePDF(tutorialId: string, date: string): Promise<Blob> {
  const response = await axios.get(`pdf/attendance/${tutorialId}/${date}`, {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/pdf',
    },
  });

  if (response.status === 200) {
    return new Blob([response.data], { type: 'application/pdf' });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function getScheinStatusPDF(): Promise<Blob> {
  const response = await axios.get('/pdf/scheinstatus/', {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/pdf',
    },
  });

  if (response.status === 200) {
    return new Blob([response.data], { type: 'application/pdf' });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function getCredentialsPDF(): Promise<Blob> {
  const response = await axios.get('/pdf/credentials/', {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/pdf',
    },
  });

  if (response.status === 200) {
    return new Blob([response.data], { type: 'application/pdf' });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}
