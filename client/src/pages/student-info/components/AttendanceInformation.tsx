import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableProps,
  TableRow,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';
import _ from 'lodash';
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

enum AttendanceDateSource {
  TUTORIAL,
  STUDENT,
}

class AttendanceDate {
  date: DateTime;
  from: AttendanceDateSource;

  constructor(date: DateTime, from: AttendanceDateSource) {
    this.date = date;
    this.from = from;
  }
}

function AttendanceInformation({
  student,
  tutorialOfStudent,
  onAttendanceChange,
  onNoteChange,
  ...props
}: AttendanceInformationProps): JSX.Element {
  const { canStudentBeExcused } = useSettings();
  const dates = useMemo(() => {
    const tutorialDates = tutorialOfStudent.dates.map(
      (date) => new AttendanceDate(date, AttendanceDateSource.TUTORIAL)
    );
    const studentDates = student
      .getDatesOfAttendances()
      .map((date) => new AttendanceDate(date, AttendanceDateSource.STUDENT));

    return _.unionWith(tutorialDates, studentDates, (a, b) => a.date === b.date).sort(
      (a, b) => a.date.toMillis() - b.date.toMillis()
    );
  }, [student, tutorialOfStudent]);

  return (
    <Table {...props}>
      <TableHead>
        <TableRow>
          <TableCell>Datum</TableCell>
          <TableCell align='center'>Anwesenheit</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {dates.map(({ date, from }) => {
          const formattedDate = date.toLocaleString(DateTime.DATE_FULL);
          const attendance: IAttendance | undefined = student.getAttendance(date);
          const source = from === AttendanceDateSource.TUTORIAL ? 'Tutorium' : 'Studierende/r';

          return (
            <TableRow key={parseDateToMapKey(date)}>
              <TableCell>
                <Typography>{formattedDate}</Typography>
                <Typography variant='body2' color='textSecondary'>{`(von: ${source})`}</Typography>
              </TableCell>
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
