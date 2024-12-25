import { TableCell, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

import { FileImportOutline as ImportIcon } from 'mdi-material-ui';
import { useNavigate } from 'react-router';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../../components/PaperTableRow';
import { ShortTest } from '../../../../model/ShortTest';
import { ROUTES } from '../../../../routes/Routing.routes';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    labelCell: {
      width: '1%',
      whiteSpace: 'nowrap',
    },
  })
);

interface Props extends PaperTableRowProps {
  shortTest: ShortTest;
  onEditClicked: (shortTest: ShortTest) => void;
  onDeleteClicked: (shortTest: ShortTest) => void;
}

function ShortTestRow({ shortTest, onEditClicked, onDeleteClicked, ...other }: Props): JSX.Element {
  const navigate = useNavigate();
  const classes = useStyles();
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
                navigate(
                  ROUTES.IMPORT_SHORT_TEST_RESULTS.buildPath({
                    shortTestId: shortTest.id,
                  })
                ),
            },
          ]}
        />
      }
      LabelCellProps={{ className: classes.labelCell }}
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
