import { Formik } from 'formik';
import React, { useCallback, useMemo } from 'react';
import { IClientSettings } from 'shared/model/Settings';
import Placeholder from '../../components/Placeholder';
import { setSettings } from '../../hooks/fetching/Settings';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { useSettings } from '../../hooks/useSettings';
import { FormikSubmitCallback } from '../../types';
import SettingsPageForm from './components/SettingsPage.form';
import {
  convertFormStateToDTO,
  FormState,
  getInitialValues,
  validationSchema,
} from './SettingsPage.helpers';

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
