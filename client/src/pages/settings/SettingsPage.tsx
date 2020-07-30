import { Box, Button, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik, useFormikContext } from 'formik';
import React, { useCallback, useMemo } from 'react';
import { IClientSettings } from 'shared/model/Settings';
import * as Yup from 'yup';
import FormikCheckbox from '../../components/forms/components/FormikCheckbox';
import FormikDebugDisplay from '../../components/forms/components/FormikDebugDisplay';
import FormikTextField from '../../components/forms/components/FormikTextField';
import GridDivider from '../../components/GridDivider';
import SubmitButton from '../../components/loading/SubmitButton';
import Placeholder from '../../components/Placeholder';
import { useDialog } from '../../hooks/DialogService';
import { setSettings } from '../../hooks/fetching/Settings';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { useSettings } from '../../hooks/useSettings';
import { FormikSubmitCallback } from '../../types';
import EMailSettings from './components/EMailSettings';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: { display: 'flex', flexDirection: 'column' },
    unsavedChangesLabel: { marginLeft: theme.spacing(1) },
    input: { margin: theme.spacing(1, 0) },
  })
);

const validationSchema = Yup.object().shape({
  canTutorExcuseStudents: Yup.boolean().required('Benötigt'),
  defaultTeamSize: Yup.number()
    .integer('Muss eine ganze Zahl sein.')
    .min(1, 'Muss mindestens 1 sein.')
    .required('Benötigt'),
  mailingConfig: Yup.lazy((value: { enabled?: boolean } | undefined | null) => {
    if (value?.enabled) {
      return Yup.object().shape({
        enabled: Yup.boolean().defined(),
        from: Yup.string()
          .required('Benötigt')
          .test({
            name: 'isValidFrom',
            message: 'Muss eine kommaseparierte Liste mit "{email}" oder "{name} <{email}>" sein',
            test: (value) => {
              if (typeof value !== 'string') {
                return false;
              }

              const regexMail = /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/;
              const regexName = /([\p{L}\p{N}",*-]|[^\S\r\n])+/;
              const regex = new RegExp(
                `^(${regexMail.source})|(${regexName.source} <${regexMail.source}>)$`,
                'u'
              );
              const mails = value.split(',').map((m) => m.trim());

              for (const mail of mails) {
                if (!regex.test(mail)) {
                  return false;
                }
              }

              return true;
            },
          }),
        host: Yup.string().required('Benötigt'),
        port: Yup.number()
          .positive('Muss eine positive Zahl sein')
          .integer('Muss eine ganze Zahl sein')
          .required('Benötigt'),
        auth: Yup.object().shape({
          user: Yup.string().required('Benötigt.'),
          pass: Yup.string().required('Benötigt.'),
        }),
      });
    } else {
      return Yup.mixed();
    }
  }),
});

interface FormState {
  defaultTeamSize: string;
  canTutorExcuseStudents: boolean;
  mailingConfig: {
    enabled: boolean;
    from: string;
    host: string;
    port: string;
    auth: { user: string; pass: string };
  };
}

function getInitialValues(settings: IClientSettings): FormState {
  const { mailingConfig, canTutorExcuseStudents, defaultTeamSize } = settings;
  return {
    canTutorExcuseStudents: canTutorExcuseStudents,
    defaultTeamSize: `${defaultTeamSize}`,
    mailingConfig: {
      enabled: !!mailingConfig,
      from: mailingConfig?.from ?? '',
      host: mailingConfig?.host ?? '',
      port: `${mailingConfig?.port ?? ''}`,
      auth: { user: mailingConfig?.auth.user ?? '', pass: mailingConfig?.auth.pass ?? '' },
    },
  };
}

function convertFormStateToDTO(values: FormState): IClientSettings {
  const dto: IClientSettings = {
    canTutorExcuseStudents: values.canTutorExcuseStudents,
    defaultTeamSize: Number.parseInt(values.defaultTeamSize),
  };

  if (values.mailingConfig.enabled) {
    const { from, host, port, auth } = values.mailingConfig;
    dto.mailingConfig = {
      from,
      host,
      port: Number.parseInt(port),
      auth: { user: auth.user, pass: auth.pass },
    };
  }

  return dto;
}

function SettingsPageForm(): JSX.Element {
  const classes = useStyles();
  const { showConfirmationDialog } = useDialog();
  const { handleSubmit, isSubmitting, dirty, isValid, resetForm } = useFormikContext<FormState>();

  const handleFormReset = useCallback(async () => {
    const result = await showConfirmationDialog({
      title: 'Einstellungen zurücksetzen?',
      content:
        'Sollen die Einstellungen wirklich zurückgesetzt werden? Dies kann nicht rückgängig gemacht werden!',
      acceptProps: { label: 'Zurücksetzen', deleteButton: true },
      cancelProps: { label: 'Abbrechen' },
    });

    if (result) {
      resetForm();
    }
  }, [showConfirmationDialog, resetForm]);

  return (
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

        <Button
          onClick={handleFormReset}
          style={{ marginLeft: 'auto' }}
          variant='outlined'
          disabled={!dirty}
        >
          Formular zurücksetzen
        </Button>
      </Box>

      <Box
        flex={1}
        display='grid'
        gridTemplateColumns='fit-content(50%) 1fr'
        gridAutoRows='min-content'
        alignItems='baseline'
        gridColumnGap={24}
        gridRowGap={12}
        height='auto'
        maxHeight='100%'
        style={{ overflowY: 'auto' }}
      >
        <Typography style={{ fontSize: '1.1rem' }}>Standardteamgröße</Typography>
        <FormikTextField
          label='Standardteamgröße'
          name='defaultTeamSize'
          type='number'
          className={classes.input}
          required
        />

        <GridDivider />

        <Typography style={{ fontSize: '1.1rem' }}>Anwesenheiten</Typography>
        <FormikCheckbox
          label='Tutoren/innen dürfen Studierende entschuldigen'
          name='canTutorExcuseStudents'
        />

        <GridDivider />

        <Typography style={{ fontSize: '1.1rem' }}>E-Maileinstellungen</Typography>
        <EMailSettings />
      </Box>

      <FormikDebugDisplay showErrors />
    </form>
  );
}

function SettingsPage(): JSX.Element {
  const { isLoadingSettings, settings, updateSettings } = useSettings();
  const { promiseWithSnackbar } = useCustomSnackbar();

  const initialValues: FormState = useMemo(() => getInitialValues(settings), [settings]);
  const onSubmit: FormikSubmitCallback<FormState> = useCallback(
    async (values) => {
      const dto: IClientSettings = convertFormStateToDTO(values);

      await promiseWithSnackbar({
        promiseFunction: setSettings,
        successContent: 'Einstellungen erfolgreich gespeichert.',
        errorContent: 'Einstellungen konnten nicht gespeichert werden.',
      })(dto);
      await promiseWithSnackbar({
        promiseFunction: updateSettings,
        errorContent: 'Neue Einstellungen konnten nicht abgerufen werden.',
      })();
    },
    [updateSettings, promiseWithSnackbar]
  );

  return (
    <Placeholder
      placeholderText='Lade Einstellungen...'
      showPlaceholder={isLoadingSettings}
      loading={isLoadingSettings}
    >
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
        <SettingsPageForm />
      </Formik>
    </Placeholder>
  );
}

export default SettingsPage;
