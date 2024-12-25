import { TableCell, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import EntityListItemMenu from '../../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../../components/PaperTableRow';
import { Sheet } from '../../../../model/Sheet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    labelCell: {
      width: '1%',
      whiteSpace: 'nowrap',
    },
  })
);

interface Props extends PaperTableRowProps {
  sheet: Sheet;
  onEditSheetClicked: (sheet: Sheet) => void;
  onDeleteSheetClicked: (sheet: Sheet) => void;
}

function SheetRow({
  sheet,
  onEditSheetClicked,
  onDeleteSheetClicked,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();
  return (
    <PaperTableRow
      label={`Blattnummer: #${sheet.sheetNo.toString().padStart(2, '0')}`}
      subText={sheet.bonusSheet ? 'Bonusblatt' : undefined}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditSheetClicked(sheet)}
          onDeleteClicked={() => onDeleteSheetClicked(sheet)}
        />
      }
      LabelCellProps={{ className: classes.labelCell }}
      {...other}
    >
      <TableCell>
        <Typography variant='body2'>Anzahl Aufgaben: {sheet.exercises.length}</Typography>
        <Typography variant='body2'>Gesamtpunktzahl: {sheet.getPointInfoAsString()}</Typography>
      </TableCell>
    </PaperTableRow>
  );
}

export default SheetRow;
