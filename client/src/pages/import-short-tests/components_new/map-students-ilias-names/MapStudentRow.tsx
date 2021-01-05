import { Button, Chip, TableCell } from '@material-ui/core';
import React from 'react';
import PaperTableRow from '../../../../components/PaperTableRow';
import { Student } from '../../../../model/Student';

interface Props {
  iliasName: string;
  mappedStudent: Student | undefined;
  onMapStudent: () => void;
  onRemoveMapping: () => void;
}

function MapStudentRow({
  iliasName,
  mappedStudent,
  onMapStudent,
  onRemoveMapping,
}: Props): JSX.Element {
  return (
    <PaperTableRow
      label={iliasName}
      elevation={0}
      buttonCellContent={<Button onClick={onMapStudent}>Studierenden zuordnen</Button>}
    >
      <TableCell>
        {mappedStudent && (
          <Chip label={mappedStudent.name} onDelete={onRemoveMapping} color='primary' />
        )}
      </TableCell>
    </PaperTableRow>
  );
}

export default MapStudentRow;
