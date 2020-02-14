import { Table, TableBody, TableCell, TableHead, TableProps, TableRow } from '@material-ui/core';
import { format } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import React from 'react';
import { Attendance, AttendanceState } from 'shared/model/Attendance';
import { Student } from 'shared/model/Student';
import { Tutorial } from 'shared/model/Tutorial';
import AttendanceControls from '../../../../components/attendance-controls/AttendanceControls';
import { parseDateToMapKey } from '../../../../util/helperFunctions';

interface Props extends TableProps {
  student: Student;
  tutorialOfStudent: Tutorial;
  onAttendanceChange: (date: Date, attendance?: AttendanceState) => void;
  onNoteChange: (date: Date, note: string) => void;
}

function AttendanceInformation({
  student,
  tutorialOfStudent,
  onAttendanceChange,
  onNoteChange,
  ...props
}: Props): JSX.Element {
  return (
    <Table {...props}>
      <TableHead>
        <TableRow>
          <TableCell>Datum</TableCell>
          <TableCell align='center'>Anwesenheit</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {tutorialOfStudent.dates
          .map(date => new Date(date))
          .map(date => {
            const dateKey = parseDateToMapKey(date);
            const formattedDate = format(date, 'dd. MMMM yyyy', {
              locale: deLocale,
            });
            const attendance: Attendance | undefined = student.attendance[dateKey];

            return (
              <TableRow key={dateKey}>
                <TableCell>{formattedDate}</TableCell>
                <TableCell align='right'>
                  <AttendanceControls
                    attendance={attendance}
                    onAttendanceChange={attendance => onAttendanceChange(date, attendance)}
                    onNoteChange={({ note }) => onNoteChange(date, note)}
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
