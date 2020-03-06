import { TableCell, Typography } from '@material-ui/core';
import { PdfBox as PDFGenerationIcon } from 'mdi-material-ui';
import React from 'react';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { Scheinexam } from '../../../model/Scheinexam';
import { getDisplayStringOfScheinExam } from '../../../util/helperFunctions';
import { getPointsOfEntityAsString } from '../../points-sheet/util/helper';

interface Props extends PaperTableRowProps {
  exam: Scheinexam;
  onEditExamClicked: (exam: Scheinexam) => void;
  onHandleGenerateResultPDFClicked: (exam: Scheinexam) => void;
  onDeleteExamClicked: (exam: Scheinexam) => void;
}

function ScheinExamRow({
  exam,
  onEditExamClicked,
  onHandleGenerateResultPDFClicked,
  onDeleteExamClicked,
  ...other
}: Props): JSX.Element {
  return (
    <PaperTableRow
      label={getDisplayStringOfScheinExam(exam)}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditExamClicked(exam)}
          onDeleteClicked={() => onDeleteExamClicked(exam)}
          additionalItems={[
            {
              primary: 'Ergebnisse',
              Icon: PDFGenerationIcon,
              onClick: () => onHandleGenerateResultPDFClicked(exam),
            },
          ]}
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
