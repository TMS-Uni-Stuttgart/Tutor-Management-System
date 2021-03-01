import { TableCell, Typography } from '@material-ui/core';
import { FileImportOutline as ImportIcon } from 'mdi-material-ui';
import React from 'react';
import { useHistory } from 'react-router';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../../components/PaperTableRow';
import { ShortTest } from '../../../../model/ShortTest';
import { ROUTES } from '../../../../routes/Routing.routes';

interface Props extends PaperTableRowProps {
  shortTest: ShortTest;
  onEditClicked: (shortTest: ShortTest) => void;
  onDeleteClicked: (shortTest: ShortTest) => void;
}

function ShortTestRow({ shortTest, onEditClicked, onDeleteClicked, ...other }: Props): JSX.Element {
  const history = useHistory();

  return (
    <PaperTableRow
      label={shortTest.toDisplayString()}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditClicked(shortTest)}
          onDeleteClicked={() => onDeleteClicked(shortTest)}
          additionalItems={[
            {
              primary: 'Ergebnisse neu importieren',
              Icon: ImportIcon,
              onClick: () =>
                history.push(
                  ROUTES.IMPORT_SHORT_TEST_RESULTS.create({
                    shortTestId: shortTest.id,
                  })
                ),
            },
          ]}
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
