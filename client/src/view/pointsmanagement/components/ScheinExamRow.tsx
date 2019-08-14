import React from 'react';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { TableCell, Typography } from '@material-ui/core';
import ListItemMenu from '../../../components/ListItemMenu';
import { ScheinExam } from '../../../typings/ServerResponses';
import { getPointsOfEntityAsString } from '../util/helper';
import { getDisplayStringOfScheinExam } from '../../../util/helperFunctions';

interface Props extends PaperTableRowProps {
  exam: ScheinExam;
  onEditExamClicked: (exam: ScheinExam) => void;
  onDeleteExamClicked: (exam: ScheinExam) => void;
}

function ScheinExamRow({
  exam,
  onEditExamClicked,
  onDeleteExamClicked,
  ...other
}: Props): JSX.Element {
  return (
    <PaperTableRow
      label={getDisplayStringOfScheinExam(exam)}
      buttonCellContent={
        <ListItemMenu
          onEditClicked={() => onEditExamClicked(exam)}
          onDeleteClicked={() => onDeleteExamClicked(exam)}
        />
      }
      {...other}
    >
      <TableCell>
        <Typography variant='body2'>Anzahl Aufgaben: {exam.exercises.length}</Typography>
        <Typography variant='body2'>Gesamtpunktzahl: {getPointsOfEntityAsString(exam)}</Typography>
      </TableCell>
    </PaperTableRow>
  );
}

export default ScheinExamRow;
