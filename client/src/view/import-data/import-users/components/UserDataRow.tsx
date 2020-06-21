import {
  Box,
  createStyles,
  IconButton,
  makeStyles,
  TableCell,
  Typography,
} from '@material-ui/core';
import { SquareEditOutline as EditIcon, Undo as ResetIcon } from 'mdi-material-ui';
import React from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import PaperTableRow from '../../../../components/PaperTableRow';
import { useDialog } from '../../../../hooks/DialogService';
import { UserFormStateValue } from '../ImportUsers';
import { Role } from '../../../../../../server/src/shared/model/Role';

const useStyles = makeStyles((theme) =>
  createStyles({
    editButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Props {
  idx: number;
}

interface EditFormState {
  roles: Role[];
  tutorials: string[];
  tutorialsToCorrect: string[];
}

const initialValues: EditFormState = { roles: [], tutorials: [], tutorialsToCorrect: [] };

function EditUserDialogContent({ idx }: Props): JSX.Element {
  // TODO: Add form to edit user.
  return <Box></Box>;
}

function UserDataRow(
  { firstname, lastname, username, roles }: UserFormStateValue,
  idx: number
): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();
  const subText = [username, ...roles].filter(Boolean).join(', ');

  const handleEditClicked = () => {
    dialog.show({
      title: `${getNameOfEntity({ firstname, lastname })} bearbeiten`,
      content: <EditUserDialogContent idx={idx} />,
      DialogProps: { maxWidth: 'lg', fullWidth: false },
    });
  };

  return (
    <PaperTableRow
      label={`${lastname}, ${firstname}`}
      subText={subText}
      buttonCellContent={
        <Box>
          <IconButton size='medium' className={classes.editButton} onClick={handleEditClicked}>
            <EditIcon />
          </IconButton>
          <IconButton size='medium'>
            <ResetIcon />
          </IconButton>
        </Box>
      }
    >
      <TableCell>
        <Typography>Keine Tutorien zugeordnet</Typography>
      </TableCell>
    </PaperTableRow>
  );
}

export default UserDataRow;
