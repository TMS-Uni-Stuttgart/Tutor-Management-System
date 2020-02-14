import { Box, BoxProps } from '@material-ui/core';
import React from 'react';
import { Attendance, AttendanceState } from 'shared/model/Attendance';
import { Role } from 'shared/model/Role';
import { useLogin } from '../../hooks/LoginService';
import AttendanceButton from '../../view/attendance/components/AttendanceButton';
import AttendanceNotePopper, { NoteFormCallback } from './components/AttendanceNotePopper';

export interface AttendanceControlsProps extends BoxProps {
  attendance?: Attendance;
  onAttendanceChange: (attendance?: AttendanceState) => void;
  onNoteChange: NoteFormCallback;
}

function AttendanceControls({
  attendance,
  onAttendanceChange,
  onNoteChange,
  ...props
}: AttendanceControlsProps): JSX.Element {
  const { userData } = useLogin();

  const handleAttendanceClick = (newState: AttendanceState) => {
    if (newState === attendance?.state) {
      onAttendanceChange(undefined);
    } else {
      onAttendanceChange(newState);
    }
  };

  return (
    <Box display='flex' alignItems='center' {...props}>
      <AttendanceNotePopper note={attendance?.note} onNoteSave={onNoteChange} />

      <AttendanceButton
        attendanceState={AttendanceState.PRESENT}
        isSelected={attendance?.state === AttendanceState.PRESENT}
        onClick={() => handleAttendanceClick(AttendanceState.PRESENT)}
        disabled={
          userData &&
          !userData.roles.includes(Role.ADMIN) &&
          attendance?.state === AttendanceState.EXCUSED
        }
      >
        Anwesend
      </AttendanceButton>

      <AttendanceButton
        attendanceState={AttendanceState.EXCUSED}
        isSelected={attendance?.state === AttendanceState.EXCUSED}
        onClick={() => handleAttendanceClick(AttendanceState.EXCUSED)}
        disabled={userData && userData.roles.includes(Role.ADMIN) ? false : true}
      >
        Entschuldigt
      </AttendanceButton>

      <AttendanceButton
        attendanceState={AttendanceState.UNEXCUSED}
        isSelected={attendance?.state === AttendanceState.UNEXCUSED}
        onClick={() => handleAttendanceClick(AttendanceState.UNEXCUSED)}
        disabled={
          userData &&
          !userData.roles.includes(Role.ADMIN) &&
          attendance?.state === AttendanceState.EXCUSED
        }
      >
        Unentschuldigt
      </AttendanceButton>
    </Box>
  );
}

export default AttendanceControls;
