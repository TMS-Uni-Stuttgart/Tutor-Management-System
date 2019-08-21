export enum AttendanceState {
  PRESENT = 'PRESENT',
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
}

export interface Attendance {
  date: Date;
  id: AttendanceId;
  note?: string;
  state?: AttendanceState;
}

export interface AttendanceId {
  date: Date;
  studentId: string;
}
