import { Box } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { useCallback, useMemo } from 'react';
import { Role } from 'shared/model/Role';
import { IsItemDisabledFunction } from '../../../../../components/CustomSelect';
import FormikSelect from '../../../../../components/forms/components/FormikSelect';
import FormikTutorialSelect from '../../../../../components/forms/components/FormikTutorialSelect';
import { Tutorial } from '../../../../../model/Tutorial';
import { UserFormState } from '../../AdjustImportedUserDataForm';
import { EditFormState } from './EditUserDialog';

interface EditUserDialogProps {
  parentFormValue: UserFormState;
  tutorials: Tutorial[];
}

function EditUserDialogContent({ parentFormValue, tutorials }: EditUserDialogProps): JSX.Element {
  const { values, setFieldValue } = useFormikContext<EditFormState>();

  const tutorialsOfOthers: string[] = useMemo(
    () =>
      Object.values(parentFormValue).flatMap((user) => {
        if (user.rowNr.toString() === values.userId) {
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

      <FormikTutorialSelect
        name='tutorials'
        label='Tutorien'
        helperText='Tutorien, die gehalten werden.'
        fullWidth
        items={tutorials}
        showLoadingIndicator={tutorials.length === 0}
        isItemDisabled={isTutorialItemDisabled}
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
        itemToString={(tutorial) => tutorial.toDisplayStringWithTime()}
        itemToValue={(tutorial) => tutorial.id}
        isItemDisabled={isTutorialToCorrectItemDisabled}
        multiple
        isItemSelected={(tutorial) => values['tutorialsToCorrect'].indexOf(tutorial.id) > -1}
        disabled={!values['roles'] || values['roles'].indexOf(Role.CORRECTOR) === -1}
      />
    </Box>
  );
}

export default EditUserDialogContent;
