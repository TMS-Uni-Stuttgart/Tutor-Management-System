import { Box } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useField } from 'formik';
import React from 'react';
import FormikCheckbox from '../../../components/forms/components/FormikCheckbox';
import FormikPasswordField from '../../../components/forms/components/FormikPasswordField';
import FormikTextField from '../../../components/forms/components/FormikTextField';

const useStyles = makeStyles((theme) =>
  createStyles({
    input: { margin: theme.spacing(1, 0) },
    portInput: { marginLeft: theme.spacing(1) },
  })
);

function EMailSettings(): JSX.Element {
  const classes = useStyles();
  const [, { value: isEnabled }] = useField<boolean>('mailingConfig.enabled');

  return (
    <Box display='grid' gridTemplateColumns='1fr'>
      <FormikCheckbox label='E-Mails aktivieren' name='mailingConfig.enabled' />

      <Box display='flex'>
        <FormikTextField
          label='Mail-Host'
          name='mailingConfig.host'
          className={classes.input}
          disabled={!isEnabled}
          required={isEnabled}
          helperText='Hostaddresse des SMTP-EMailservers.'
        />
        <FormikTextField
          label='Mail-Port'
          name='mailingConfig.port'
          type='number'
          className={clsx(classes.input, classes.portInput)}
          disabled={!isEnabled}
          required={isEnabled}
          helperText='Port des SMTP-EMailservers.'
        />
      </Box>

      <FormikTextField
        label='Nutzername'
        name='mailingConfig.auth.user'
        className={classes.input}
        disabled={!isEnabled}
        required={isEnabled}
        helperText='Nutzername des Accounts, von dem aus die Mails verschickt werden sollen.'
      />

      <FormikPasswordField
        label='Passwort'
        name='mailingConfig.auth.pass'
        className={classes.input}
        disabled={!isEnabled}
        required={isEnabled}
        helperText='Passwort des Accounts.'
      />

      <FormikTextField
        label='Absender'
        name='mailingConfig.from'
        className={classes.input}
        disabled={!isEnabled}
        required={isEnabled}
        helperText='Wird als Absender angezeigt. Kann in der Form "{email}" oder "{name} <{email}>" sein.'
      />

      <FormikTextField
        label='Zugangsdaten E-Mailbetreff'
        name='mailingConfig.subject'
        className={classes.input}
        disabled={!isEnabled}
        required={isEnabled}
        helperText='Der Betreff für die Mails mit den Zugangsdaten.'
      />
    </Box>
  );
}

export default EMailSettings;
