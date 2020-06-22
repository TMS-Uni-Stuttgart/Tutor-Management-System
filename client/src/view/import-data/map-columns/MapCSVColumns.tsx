import React from 'react';
import { useImportDataContext } from '../ImportUsers.context';
import { makeStyles, createStyles, Box, Typography } from '@material-ui/core';
import { Formik } from 'formik';
import FormikSelect from '../../../components/forms/components/FormikSelect';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      minWidth: 210,
      marginTop: theme.spacing(2),
    },
  })
);

function NO_OP() {
  /* No-Op */
}

function MapCSVColumns(): JSX.Element {
  const classes = useStyles();

  const { setNextCallback, removeNextCallback } = useStepper();
  const {
    data: { headers },
    mappedColumns,
  } = useImportDataContext();

  // TODO: Hook nextCallback with "sending" the form.
  // TODO: Disabled next button if form is not valid.

  return (
    <Formik initialValues={mappedColumns} onSubmit={NO_OP}>
      <Box display='flex' flexDirection='column' padding={1}>
        <Typography>Spalten zuordnen</Typography>

        <FormikSelect
          name='firstnameColumn'
          label='Vorname'
          required
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <FormikSelect
          name='lastnameColumn'
          label='Nachname'
          required
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <FormikSelect
          name='emailColumn'
          label='E-Mailadresse'
          required
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <FormikSelect
          name='rolesColumn'
          label='Rollen'
          nameOfNoneItem='Keine Spalte auswählen'
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <FormikSelect
          name='usernameColumn'
          label='Nutzername'
          nameOfNoneItem='Keine Spalte auswählen'
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <FormikSelect
          name='passwordColumn'
          label='Passwort'
          nameOfNoneItem='Keine Spalte auswählen'
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <FormikDebugDisplay />
      </Box>
    </Formik>
  );
}

export default MapCSVColumns;
