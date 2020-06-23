import {
  Box,
  Button,
  Chip,
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
import React, { useState, useMemo, useCallback } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import { Role } from '../../../../../../server/src/shared/model/Role';
import FormikSelect from '../../../../components/forms/components/FormikSelect';
import PaperTableRow from '../../../../components/PaperTableRow';
import { FormikSubmitCallback } from '../../../../types';
import { useImportDataContext } from '../../ImportUsers.context';
import { UserFormStateValue, UserFormState } from '../AdjustImportedUserDataForm';
import { Tutorial } from '../../../../model/Tutorial';
import { IsItemDisabledFunction } from '../../../../components/CustomSelect';

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

interface EditUserDialogProps {
  parentFormValue: UserFormState;
}

interface EditFormState {
  userId: string;
  roles: Role[];
  tutorials: string[];
  tutorialsToCorrect: string[];
}

function calculateInitialValues(value: UserFormStateValue): EditFormState {
  const { roles, tutorials, tutorialsToCorrect, id } = value;

  return { userId: id, roles, tutorials, tutorialsToCorrect };
}

function EditUserDialogContent({ parentFormValue }: EditUserDialogProps): JSX.Element {
  const { values, setFieldValue } = useFormikContext<EditFormState>();
  const { tutorials } = useImportDataContext();

  const tutorialsOfOthers: string[] = useMemo(
    () =>
      Object.values(parentFormValue).flatMap((user) => {
        if (user.id === values.userId) {
          return [];
        }

        return [...user.tutorials];
      }),
    [parentFormValue, values.userId]
  );

  const isTutorialItemDisabled: IsItemDisabledFunction<Tutorial> = useCallback(
    (tutorial) => {
      const isSelectedByOther = tutorialsOfOthers.findIndex((id) => id === tutorial.id) !== -1;

      if (isSelectedByOther) {
        return { isDisabled: true, reason: 'Anderem/r Nutzer/in zugeordnet.' };
      }

      const isCorrectedBySelf =
        values.tutorialsToCorrect.findIndex((id) => id === tutorial.id) !== -1;

      if (isCorrectedBySelf) {
        return { isDisabled: true, reason: 'Nutzer/in korrigiert Tutorium bereits.' };
      }

      return { isDisabled: false };
    },
    [tutorialsOfOthers, values.tutorialsToCorrect]
  );

  const isTutorialToCorrectItemDisabled: IsItemDisabledFunction<Tutorial> = useCallback(
    (tutorial) => {
      const isHoldBySelf = values.tutorials.findIndex((id) => id === tutorial.id) !== -1;

      if (isHoldBySelf) {
        return { isDisabled: true, reason: 'Nutzer/in hält Tutorium bereits.' };
      }

      return { isDisabled: false };
    },
    [values.tutorials]
  );

  return (
    <Box display='grid' gridTemplateRows='repeat(3, 1fr)' gridRowGap={16}>
      <FormikSelect
        name='roles'
        label='Rolle'
        required
        fullWidth
        emptyPlaceholder='Keine Rollen vorhanden.'
        onChange={(e: any) => {
          const roles: string[] = e.target.value;

          if (!roles.includes(Role.TUTOR)) {
            setFieldValue('tutorials', []);
          }

          if (!roles.includes(Role.CORRECTOR)) {
            setFieldValue('tutorialsToCorrect', []);
          }
        }}
        items={[Role.ADMIN, Role.CORRECTOR, Role.TUTOR, Role.EMPLOYEE]}
        itemToString={(role) => Role[role].toString()}
        itemToValue={(role) => role}
        multiple
        isItemSelected={(role) => values['roles'].indexOf(role) > -1}
      />

      <FormikSelect
        name='tutorials'
        label='Tutorien'
        helperText='Tutorien, die gehalten werden.'
        emptyPlaceholder='Keine Tutorien vorhanden.'
        fullWidth
        items={tutorials}
        showLoadingIndicator={tutorials.length === 0}
        itemToString={(tutorial) => tutorial.toDisplayString()}
        itemToValue={(tutorial) => tutorial.id}
        isItemDisabled={isTutorialItemDisabled}
        multiple
        isItemSelected={(tutorial) => values['tutorials'].indexOf(tutorial.id) > -1}
        disabled={!values['roles'] || values['roles'].indexOf(Role.TUTOR) === -1}
      />

      <FormikSelect
        name='tutorialsToCorrect'
        label='Korrigierte Tutorien'
        helperText='Tutorien, die korrigiert werden.'
        emptyPlaceholder='Keine Tutorien vorhanden.'
        fullWidth
        items={tutorials}
        showLoadingIndicator={tutorials.length === 0}
        itemToString={(tutorial) => tutorial.toDisplayString()}
        itemToValue={(tutorial) => tutorial.id}
        isItemDisabled={isTutorialToCorrectItemDisabled}
        multiple
        isItemSelected={(tutorial) => values['tutorialsToCorrect'].indexOf(tutorial.id) > -1}
        disabled={!values['roles'] || values['roles'].indexOf(Role.CORRECTOR) === -1}
      />
    </Box>
  );
}

interface UserDataRowProps {
  name: string;
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

function UserDataRow({ name }: UserDataRowProps): JSX.Element {
  const classes = useStyles();

  const [showDialog, setShowDialog] = useState(false);
  const { values: parentValues } = useFormikContext<UserFormState>();
  const [, meta, helpers] = useField<UserFormStateValue>(name);
  const { tutorials } = useImportDataContext();

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
        <Dialog open onClose={() => setShowDialog(false)} maxWidth='lg'>
          <Formik initialValues={calculateInitialValues(meta.value)} onSubmit={handleFormSubmit}>
            {({ submitForm }) => (
              <>
                <DialogTitle>{getNameOfEntity({ firstname, lastname })} bearbeiten</DialogTitle>

                <DialogContent style={{ minWidth: 400 }}>
                  <EditUserDialogContent parentFormValue={parentValues} />
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
