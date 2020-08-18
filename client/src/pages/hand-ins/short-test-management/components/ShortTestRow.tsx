import { TableCell, Typography } from '@material-ui/core';
import React from 'react';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../../components/PaperTableRow';
import { ShortTest } from '../../../../model/ShortTest';

interface Props extends PaperTableRowProps {
  shortTest: ShortTest;
  onEditClicked: (shortTest: ShortTest) => void;
  onDeleteClicked: (shortTest: ShortTest) => void;
}

function ShortTestRow({ shortTest, onEditClicked, onDeleteClicked, ...other }: Props): JSX.Element {
  return (
    <PaperTableRow
      label={shortTest.toDisplayString()}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditClicked(shortTest)}
          onDeleteClicked={() => onDeleteClicked(shortTest)}
          // additionalItems={[
          //   {
          //     primary: 'Ergebnisse',
          //     Icon: PDFGenerationIcon,
          //     onClick: () => onHandleGenerateResultPDFClicked(exam),
          //   },
          // ]}
        />
      }
      {...other}
    >
      <TableCell>
        <Typography variant='body2'>Anzahl Aufgaben: {shortTest.exercises.length}</Typography>
        <Typography variant='body2'>Gesamtpunktzahl: {shortTest.getPointInfoAsString()}</Typography>
      </TableCell>
    </PaperTableRow>
  );
}

export default ShortTestRow;
