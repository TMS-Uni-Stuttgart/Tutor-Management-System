import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  TableCell,
  Typography,
} from '@material-ui/core';
import { Formik, useField, useFormikContext } from 'formik';
import { SquareEditOutline as EditIcon, Undo as ResetIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import { Role } from '../../../../../../server/src/shared/model/Role';
import PaperTableRow from '../../../../components/PaperTableRow';
import { UserFormStateValue } from '../ImportUsers';

const useStyles = makeStyles((theme) =>
  createStyles({
    editButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface EditFormState {
  roles: Role[];
  tutorials: string[];
  tutorialsToCorrect: string[];
}

function calculateInitialValues(value: UserFormStateValue): EditFormState {
  return { roles: [], tutorials: [], tutorialsToCorrect: [] };
}

function EditUserDialogContent(): JSX.Element {
  const { values } = useFormikContext<EditFormState>();
  // TODO: Add form to edit user.

  return <Box>{JSON.stringify(values, null, 2)}</Box>;
}

interface UserDataRowProps {
  name: string;
}

function UserDataRow({ name }: UserDataRowProps): JSX.Element {
  const classes = useStyles();

  const [showDialog, setShowDialog] = useState(false);
  const [, meta, helpers] = useField<UserFormStateValue>(name);

  const { firstname, lastname, username, roles } = meta.value;
  const subText = [username, ...roles].filter(Boolean).join(', ');

  const handleEditClicked = () => {
    setShowDialog(true);
  };

  return (
    <>
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
          <Typography>
            <i>Keine Tutorien zugeordnet.</i>
          </Typography>
        </TableCell>
      </PaperTableRow>

      {showDialog && (
        <Dialog open onClose={() => setShowDialog(false)} maxWidth='lg'>
          <Formik initialValues={calculateInitialValues(meta.value)} onSubmit={() => {}}>
            {({ submitForm }) => (
              <>
                <DialogTitle>{getNameOfEntity({ firstname, lastname })} bearbeiten</DialogTitle>

                <DialogContent>
                  <EditUserDialogContent />
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => setShowDialog(false)}>Abbrechen</Button>

                  <Button color='primary' onClick={submitForm}>
                    Speichern
                  </Button>
                </DialogActions>
              </>
            )}
          </Formik>
        </Dialog>
      )}
    </>
  );
}

export default UserDataRow;
