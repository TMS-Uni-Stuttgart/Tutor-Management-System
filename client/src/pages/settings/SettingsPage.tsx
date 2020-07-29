import { Box, Divider, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik } from 'formik';
import React, { useCallback, useMemo } from 'react';
import { IClientSettings } from 'shared/model/Settings';
import * as Yup from 'yup';
import FormikCheckbox from '../../components/forms/components/FormikCheckbox';
import FormikTextField from '../../components/forms/components/FormikTextField';
import SubmitButton from '../../components/loading/SubmitButton';
import Placeholder from '../../components/Placeholder';
import { setSettings } from '../../hooks/fetching/Settings';
import { useSettings } from '../../hooks/useSettings';
import { FormikSubmitCallback } from '../../types';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: { display: 'flex', flexDirection: 'column' },
    unsavedChangesLabel: { marginLeft: theme.spacing(1) },
    input: { margin: theme.spacing(1, 0) },
  })
);

const validationSchema = Yup.object<FormState>().shape({
  canTutorExcuseStudents: Yup.boolean().required('Benötigt'),
  defaultTeamSize: Yup.number()
    .integer('Muss eine ganze Zahl sein.')
    .min(1, 'Muss mindestens 1 sein.')
    .required('Benötigt'),
});

interface FormState {
  defaultTeamSize: string;
  canTutorExcuseStudents: boolean;
}

function GridDivider(): JSX.Element {
  return <Divider style={{ gridColumn: '1 / -1' }} />;
}

function SettingsPage(): JSX.Element {
  const classes = useStyles();
  const { isLoadingSettings, settings, updateSettings } = useSettings();

  const initialValues: FormState = useMemo(() => {
    return {
      canTutorExcuseStudents: settings.canTutorExcuseStudents,
      defaultTeamSize: `${settings.defaultTeamSize}`,
    };
  }, [settings]);
  const onSubmit: FormikSubmitCallback<FormState> = useCallback(
    async (values, helpers) => {
      const dto: IClientSettings = {
        canTutorExcuseStudents: values.canTutorExcuseStudents,
        defaultTeamSize: Number.parseInt(values.defaultTeamSize),
      };

      await setSettings(dto);
      await updateSettings();

      // helpers.resetForm({ values });
    },
    [updateSettings]
  );

  return (
    <Placeholder
      placeholderText='Lade Einstellungen...'
      showPlaceholder={isLoadingSettings}
      loading={isLoadingSettings}
    >
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
        {({ handleSubmit, isValid, dirty, isSubmitting }) => (
          <form onSubmit={handleSubmit} className={classes.form}>
            <Box display='flex' alignItems='center' marginBottom={3}>
              <SubmitButton
                variant='contained'
                color='primary'
                isSubmitting={isSubmitting}
                disabled={!dirty || !isValid}
              >
                Einstellungen speichern
              </SubmitButton>

              {dirty && (
                <Typography color='error' className={classes.unsavedChangesLabel}>
                  Es gibt ungespeicherte Änderungen.
                </Typography>
              )}
            </Box>

            <Box
              flex={1}
              display='grid'
              gridTemplateColumns='fit-content(50%) 1fr'
              gridAutoRows='min-content'
              alignItems='center'
              gridColumnGap={24}
              gridRowGap={12}
              height='auto'
              maxHeight='100%'
              style={{ overflowY: 'auto' }}
            >
              <Typography variant='h6'>Standardteamgröße</Typography>
              <FormikTextField
                label='Standardteamgröße'
                name='defaultTeamSize'
                type='number'
                className={classes.input}
              />

              <GridDivider />

              <Typography variant='h6'>Anwesenheiten</Typography>
              <FormikCheckbox
                label='Tutoren/innen dürfen Studierende entschuldigen'
                name='canTutorExcuseStudents'
              />

              <GridDivider />

              <Typography variant='h6'>E-Maileinstellungen</Typography>
              <Typography>🛠 Work in progress</Typography>
            </Box>
          </form>
        )}
      </Formik>
    </Placeholder>
  );
}

export default SettingsPage;
