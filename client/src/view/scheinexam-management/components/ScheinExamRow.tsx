import { TableCell, Typography } from '@material-ui/core';
import React from 'react';
import { IScheinExam } from 'shared/model/Scheinexam';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { getDisplayStringOfScheinExam } from '../../../util/helperFunctions';
import { getPointsOfEntityAsString } from '../../points-sheet/util/helper';
import { PdfBox as PDFGenerationIcon } from 'mdi-material-ui';

interface Props extends PaperTableRowProps {
  exam: IScheinExam;
  onEditExamClicked: (exam: IScheinExam) => void;
  onHandleGenerateResultPDFClicked: (exam: IScheinExam) => void;
  onDeleteExamClicked: (exam: IScheinExam) => void;
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
