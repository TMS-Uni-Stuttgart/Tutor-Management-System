import { TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { Attendance, AttendanceState } from 'shared/dist/model/Attendance';
import AttendanceControls from '../../../components/attendance-controls/AttendanceControls';
import { NoteFormCallback } from '../../../components/attendance-controls/components/AttendanceNotePopper';
import PaperTableRow from '../../../components/PaperTableRow';
import StudentAvatar from '../../../components/student-icon/StudentAvatar';
import { StudentWithFetchedTeam } from '../../../typings/types';
import { getAttendanceColor } from './AttendanceButton';
import CakeCount from './CakeCount';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      height: 76,
    },
    cakeIcon: {
      marginLeft: theme.spacing(0.5),
    },
  })
);

interface Props {
  student: StudentWithFetchedTeam;
  attendance: Attendance | undefined;
  onAttendanceSelection: (state?: AttendanceState) => void;
  onNoteSave: NoteFormCallback;
  onCakeCountChanged?: (cakeCount: number) => void;
}

function StudentAttendanceRow({
  student,
  attendance,
  onAttendanceSelection,
  onNoteSave,
  onCakeCountChanged,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();

  const attendanceState: AttendanceState | undefined = attendance ? attendance.state : undefined;

  return (
    <PaperTableRow
      label={`${student.lastname}, ${student.firstname}`}
      subText={
        student.team ? `Team: #${student.team.teamNo.toString().padStart(2, '0')}` : 'Kein Team'
      }
      Avatar={<StudentAvatar student={student} />}
      SubTextProps={!student.team ? { color: 'error' } : undefined}
      {...rest}
      className={clsx(classes.row)}
      colorOfBottomBar={attendanceState ? getAttendanceColor(attendanceState, theme) : undefined}
    >
      {onCakeCountChanged && (
        <TableCell>
          <CakeCount cakeCount={student.cakeCount} onCakeCountChanged={onCakeCountChanged} />
        </TableCell>
      )}

      <TableCell align='right'>
        <AttendanceControls
          attendance={attendance}
          onAttendanceChange={onAttendanceSelection}
          onNoteChange={onNoteSave}
          justifyContent='flex-end'
        />
      </TableCell>
    </PaperTableRow>
  );
}

export default StudentAttendanceRow;
