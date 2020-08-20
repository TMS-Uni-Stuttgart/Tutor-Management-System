import {
  Box,
  Chip,
  createStyles,
  IconButton,
  makeStyles,
  TableCell,
  Typography,
} from '@material-ui/core';
import { useField, useFormikContext } from 'formik';
import { SquareEditOutline as EditIcon, Undo as ResetIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import PaperTableRow from '../../../../components/PaperTableRow';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import { Tutorial } from '../../../../model/Tutorial';
import { FormikSubmitCallback } from '../../../../types';
import { UserFormState, UserFormStateValue } from '../AdjustImportedUserDataForm';
import EditUserDialog, { EditFormState } from './edit-user-dialog/EditUserDialog';

const useStyles = makeStyles((theme) =>
  createStyles({
    chip: {
      margin: theme.spacing(0, 1, 1, 0),
    },
    editButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface UserDataRowProps {
  name: string;
  tutorials: Tutorial[];
}

interface TutorialOfUser {
  id: string;
  isCorrector: boolean;
}

function getTutorialsOfUser(value: UserFormStateValue): TutorialOfUser[] {
  const { tutorials, tutorialsToCorrect } = value;
  const tutorialsOfUser: TutorialOfUser[] = [];

  tutorials.forEach((id) => tutorialsOfUser.push({ id, isCorrector: false }));
  tutorialsToCorrect.forEach((id) => tutorialsOfUser.push({ id, isCorrector: true }));

  return tutorialsOfUser;
}

function UserDataRow({ name, tutorials }: UserDataRowProps): JSX.Element {
  const classes = useStyles();

  const [showDialog, setShowDialog] = useState(false);
  const { values: parentValues } = useFormikContext<UserFormState>();
  const [, meta, helpers] = useField<UserFormStateValue>(name);
  const { showConfirmationDialog } = useDialog();

  const { firstname, lastname, username, roles } = meta.value;
  const tutorialsOfUser = getTutorialsOfUser(meta.value);
  const subText = [username, ...roles].filter(Boolean).join(', ');

  const handleEditClicked = () => {
    setShowDialog(true);
  };

  const handleFormSubmit: FormikSubmitCallback<EditFormState> = (values) => {
    helpers.setValue({
      ...meta.value,
      roles: values.roles,
      tutorials: values.tutorials,
      tutorialsToCorrect: values.tutorialsToCorrect,
    });

    setShowDialog(false);
  };

  const handleResetClicked = async () => {
    if (!meta.initialValue) {
      return;
    }

    const name: string = getNameOfEntity({ firstname, lastname }, { firstNameFirst: true });
    const isAcceptReset = await showConfirmationDialog({
      title: `${name} zurücksetzen?`,
      content: `Sollen die Erstell-Daten für "${name}" wirklich zurückgesetzt werden? Dies kann nicht rückgängig gemacht werden.`,
      acceptProps: { label: 'Zurücksetzen', deleteButton: true },
      cancelProps: { label: 'Nicht zurücksetzen' },
    });

    if (isAcceptReset) {
      helpers.setValue(meta.initialValue);
    }
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
            <IconButton size='medium' onClick={handleResetClicked} disabled={!meta.initialValue}>
              <ResetIcon />
            </IconButton>
          </Box>
        }
      >
        <TableCell>
          {tutorialsOfUser.length === 0 ? (
            <Typography>
              <i>Keine Tutorien zugeordnet.</i>
            </Typography>
          ) : (
            tutorialsOfUser.map(({ id, isCorrector }) => {
              const tutorial = tutorials.find((tut) => tut.id === id);

              if (!tutorial) {
                return null;
              } else {
                const label = isCorrector
                  ? `Korrigiert: ${tutorial.toDisplayString()}`
                  : tutorial.toDisplayString();

                return (
                  <Chip
                    key={id}
                    className={classes.chip}
                    label={label}
                    color={isCorrector ? 'default' : 'primary'}
                  />
                );
              }
            })
          )}
        </TableCell>
      </PaperTableRow>

      {showDialog && (
        <EditUserDialog
          open
          onClose={() => setShowDialog(false)}
          onCancelClicked={() => setShowDialog(false)}
          onFormSubmit={handleFormSubmit}
          userFormValue={meta.value}
          parentValues={parentValues}
          tutorials={tutorials}
        />
      )}
    </>
  );
}

export default UserDataRow;
