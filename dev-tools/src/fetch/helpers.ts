import { AxiosInstance } from 'axios';
import { AttendanceDTO, Attendance } from 'shared/src/model/Attendance';
import { UpdatePointsDTO } from 'shared/src/model/Points';
import { SheetDTO, Sheet } from 'shared/src/model/Sheet';

export async function createSheet(sheetInfo: SheetDTO, axios: AxiosInstance): Promise<Sheet> {
  const response = await axios.post<Sheet>('sheet', sheetInfo);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function setAttendanceOfStudent(
  id: string,
  attendanceInfo: AttendanceDTO,
  axios: AxiosInstance
): Promise<Attendance> {
  const response = await axios.put<Attendance>(`student/${id}/attendance`, attendanceInfo);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function setPointsOfStudent(
  studentId: string,
  points: UpdatePointsDTO,
  axios: AxiosInstance
): Promise<void> {
  const response = await axios.put(`student/${studentId}/point`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}
