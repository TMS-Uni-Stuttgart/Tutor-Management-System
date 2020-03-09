import { AxiosInstance } from 'axios';
import { IAttendance, IAttendanceDTO } from 'shared/model/Attendance';
import { IGradingDTO } from 'shared/model/Points';
import { ISheet, ISheetDTO } from 'shared/model/Sheet';

export async function createSheet(sheetInfo: ISheetDTO, axios: AxiosInstance): Promise<ISheet> {
  const response = await axios.post<ISheet>('sheet', sheetInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function setAttendanceOfStudent(
  id: string,
  attendanceInfo: IAttendanceDTO,
  axios: AxiosInstance
): Promise<IAttendance> {
  const response = await axios.put<IAttendance>(`student/${id}/attendance`, attendanceInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function setPointsOfStudent(
  studentId: string,
  points: IGradingDTO,
  axios: AxiosInstance
): Promise<void> {
  const response = await axios.put(`student/${studentId}/point`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}
