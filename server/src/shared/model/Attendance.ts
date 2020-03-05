export enum AttendanceState {
  PRESENT = 'PRESENT',
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
}

export interface IAttendance {
  date: string;
  note?: string;
  state?: AttendanceState;
}

export interface IAttendanceDTO {
  date: string;
  note?: string;
  state?: AttendanceState;
}
