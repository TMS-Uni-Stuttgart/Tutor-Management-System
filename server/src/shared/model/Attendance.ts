export enum AttendanceState {
  PRESENT = 'PRESENT',
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
}

export interface Attendance {
  date: string;
  note?: string;
  state?: AttendanceState;
}

export interface AttendanceId {
  date: string;
  studentId: string;
}

export interface IAttendanceDTO {
  date: string;
  note?: string;
  state?: AttendanceState;
}
