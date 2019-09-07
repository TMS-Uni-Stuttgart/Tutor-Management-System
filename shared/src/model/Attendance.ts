export enum AttendanceState {
  PRESENT = 'PRESENT',
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
}

export interface Attendance {
  date: Date;
  note?: string;
  state?: AttendanceState;
}

export interface AttendanceId {
  date: Date;
  studentId: string;
}

export interface AttendanceDTO {
  date: string;
  note?: string;
  state?: AttendanceState;
}
