import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import React from 'react';
import { StudentStatus } from 'shared/model/Student';
import InfoPaper, { InfoPaperProps } from '../../../components/info-paper/InfoPaper';
import { Student } from '../../../model/Student';

interface Props extends Omit<InfoPaperProps, 'title'> {
  student: Student;
}

const STATUS_TO_STRING: { [key in StudentStatus]: string } = {
  [StudentStatus.ACTIVE]: 'Aktiv',
  [StudentStatus.INACTIVE]: 'Inaktiv',
  [StudentStatus.NO_SCHEIN_REQUIRED]: 'Hat Schein bereits',
};

function StudentDetails({ student, ...props }: Props): JSX.Element {
  return (
    <InfoPaper {...props} title='Details'>
      <Table size='small'>
        <TableBody>
          <TableRow hover>
            <TableCell>Status</TableCell>
            <TableCell>{STATUS_TO_STRING[student.status] || 'Kein Status'}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>Matrikelnummer</TableCell>
            <TableCell>{student.matriculationNo ?? 'Keine Matrikelnummer'}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>E-Mail</TableCell>
            <TableCell>{student.email || 'Keine E-Mailadresse'}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>Iliasname</TableCell>
            <TableCell>{student.iliasName || 'Kein Iliasname'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </InfoPaper>
  );
}

export default StudentDetails;
