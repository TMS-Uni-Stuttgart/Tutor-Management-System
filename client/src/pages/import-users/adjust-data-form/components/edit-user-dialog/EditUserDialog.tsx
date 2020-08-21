import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from '@material-ui/core';
import { Formik } from 'formik';
import React from 'react';
import { Role } from 'shared/model/Role';
import { getNameOfEntity } from 'shared/util/helpers';
import { Tutorial } from '../../../../../model/Tutorial';
import { FormikSubmitCallback } from '../../../../../types';
import { UserFormState, UserFormStateValue } from '../../AdjustImportedUserDataForm';
import EditUserDialogContent from './EditUserDialogContent';

export interface EditFormState {
  userId: string;
  roles: Role[];
  tutorials: string[];
  tutorialsToCorrect: string[];
}

interface Props extends DialogProps {
  parentValues: UserFormState;
  userFormValue: UserFormStateValue;
  onCancelClicked: ButtonProps['onClick'];
  onFormSubmit: FormikSubmitCallback<EditFormState>;
  tutorials: Tutorial[];
}

function calculateInitialValues(value: UserFormStateValue): EditFormState {
  const { roles, tutorials, tutorialsToCorrect, rowNr } = value;

  return { userId: rowNr.toString(), roles, tutorials, tutorialsToCorrect };
}

function EditUserDialog({
  onFormSubmit,
  parentValues,
  userFormValue,
  onCancelClicked,
  tutorials,
  ...props
}: Props): JSX.Element {
  const { firstname, lastname } = userFormValue;

  return (
    <Dialog maxWidth='lg' {...props}>
      <Formik initialValues={calculateInitialValues(userFormValue)} onSubmit={onFormSubmit}>
        {({ submitForm }) => (
          <>
            <DialogTitle>{getNameOfEntity({ firstname, lastname })} bearbeiten</DialogTitle>

            <DialogContent style={{ minWidth: 400 }}>
              <EditUserDialogContent tutorials={tutorials} parentFormValue={parentValues} />
            </DialogContent>

            <DialogActions>
              <Button onClick={onCancelClicked}>Abbrechen</Button>

              <Button color='primary' onClick={submitForm}>
                Speichern
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}

export default EditUserDialog;
