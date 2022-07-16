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
  const response = await axios.get('/pdf/scheinoverview', {
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

export async function getClearScheinStatusPDF(): Promise<Blob> {
  const response = await axios.get('/pdf/scheinoverview?clearMatriculationNos=true', {
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

export async function getScheinexamResultPDF(examId: string): Promise<Blob> {
  const response = await axios.get(`/pdf/scheinexam/${examId}/result`, {
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
  const response = await axios.get('/pdf/credentials', {
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

export async function getTeamGradingFile(
  tutorialId: string,
  sheetId: string,
  teamId: string
): Promise<Blob> {
  const response = await axios.get(
    `/pdf/grading/tutorial/${tutorialId}/sheet/${sheetId}/team/${teamId}`,
    {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/pdf, application/zip',
      },
    }
  );

  if (response.status === 200) {
    const contentType = response.headers['content-type'];

    if (!contentType) {
      return Promise.reject('No "content-type" header was present in response.');
    }

    return new Blob([response.data], { type: contentType });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function getTeamGradingFilename(
  tutorialId: string,
  sheetId: string,
  teamId: string
): Promise<string> {
  const response = await axios.get<string>(
    `/pdf/grading/filename/tutorial/${tutorialId}/sheet/${sheetId}/team/${teamId}`
  );

  return response.status === 200
    ? response.data
    : Promise.reject(`Wrong response code (${response.status})`);
}

export async function getCorrectionCommentPDFs(tutorialId: string, sheetId: string): Promise<Blob> {
  const response = await axios.get(`/pdf/grading/tutorial/${tutorialId}/sheet/${sheetId}`, {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/zip',
    },
  });

  if (response.status === 200) {
    return new Blob([response.data], { type: 'application/zip' });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function getCorrectionCommentPDFsFilename(
  tutorialId: string,
  sheetId: string
): Promise<string> {
  const response = await axios.get<string>(
    `/pdf/grading/filename/tutorial/${tutorialId}/sheet/${sheetId}`
  );

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function getTutorialXLSX(tutorialId: string): Promise<Blob> {
  const response = await axios.get(`/excel/tutorial/${tutorialId}`, {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  if (response.status === 200) {
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function getScheinStatusXLSX(): Promise<Blob> {
  const response = await axios.get(`/excel/schein-information`, {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  if (response.status === 200) {
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}
