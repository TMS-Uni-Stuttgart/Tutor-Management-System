import { Table, TableBody, TableCell, TableHead, TableProps, TableRow } from '@material-ui/core';
import { DateTime } from 'luxon';
import React from 'react';
import { AttendanceState, IAttendance } from 'shared/model/Attendance';
import AttendanceControls from '../../../components/attendance-controls/AttendanceControls';
import { useSettings } from '../../../hooks/useSettings';
import { Student } from '../../../model/Student';
import { Tutorial } from '../../../model/Tutorial';
import { parseDateToMapKey } from '../../../util/helperFunctions';

export interface AttendanceInformationProps extends TableProps {
  student: Student;
  tutorialOfStudent: Tutorial;
  onAttendanceChange: (date: DateTime, attendance?: AttendanceState) => void;
  onNoteChange: (date: DateTime, note: string) => void;
}

function AttendanceInformation({
  student,
  tutorialOfStudent,
  onAttendanceChange,
  onNoteChange,
  ...props
}: AttendanceInformationProps): JSX.Element {
  const { canStudentBeExcused } = useSettings();

  return (
    <Table {...props}>
      <TableHead>
        <TableRow>
          <TableCell>Datum</TableCell>
          <TableCell align='center'>Anwesenheit</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {tutorialOfStudent.dates.map((date) => {
          const formattedDate = date.toLocaleString(DateTime.DATE_FULL);
          const attendance: IAttendance | undefined = student.getAttendance(date);

          return (
            <TableRow key={parseDateToMapKey(date)}>
              <TableCell>{formattedDate}</TableCell>
              <TableCell align='right'>
                <AttendanceControls
                  attendance={attendance}
                  onAttendanceChange={(attendance) => onAttendanceChange(date, attendance)}
                  onNoteChange={({ note }) => onNoteChange(date, note)}
                  excuseDisabled={!canStudentBeExcused()}
                  justifyContent='flex-end'
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default AttendanceInformation;
