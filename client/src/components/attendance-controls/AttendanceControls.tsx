import { Box, BoxProps } from '@material-ui/core';
import React from 'react';
import { AttendanceState, IAttendance } from 'shared/model/Attendance';
import AttendanceButton from '../../pages/attendance/components/AttendanceButton';
import AttendanceNotePopper, { NoteFormCallback } from './components/AttendanceNotePopper';

export interface AttendanceControlsProps extends BoxProps {
  attendance?: IAttendance;
  onAttendanceChange: (attendance?: AttendanceState) => void;
  onNoteChange: NoteFormCallback;
  excuseDisabled: boolean;
}

function AttendanceControls({
  attendance,
  onAttendanceChange,
  onNoteChange,
  excuseDisabled,
  ...props
}: AttendanceControlsProps): JSX.Element {
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
        disabled={excuseDisabled && attendance?.state === AttendanceState.EXCUSED}
      >
        Anwesend
      </AttendanceButton>

      <AttendanceButton
        attendanceState={AttendanceState.EXCUSED}
        isSelected={attendance?.state === AttendanceState.EXCUSED}
        onClick={() => handleAttendanceClick(AttendanceState.EXCUSED)}
        disabled={excuseDisabled}
      >
        Entschuldigt
      </AttendanceButton>

      <AttendanceButton
        attendanceState={AttendanceState.UNEXCUSED}
        isSelected={attendance?.state === AttendanceState.UNEXCUSED}
        onClick={() => handleAttendanceClick(AttendanceState.UNEXCUSED)}
        disabled={excuseDisabled && attendance?.state === AttendanceState.EXCUSED}
      >
        Unentschuldigt
      </AttendanceButton>
    </Box>
  );
}

export default AttendanceControls;
