import { Box, createStyles, makeStyles, Typography } from '@material-ui/core';
import { Formik, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import * as Yup from 'yup';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import FormikSelect from '../../../components/forms/components/FormikSelect';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';
import { MappedColumns, useImportDataContext } from '../ImportUsers.context';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      minWidth: 210,
      marginTop: theme.spacing(2),
    },
  })
);

const validationSchema = Yup.object().shape({
  firstnameColumn: Yup.string().required('Benötigt.'),
  lastnameColumn: Yup.string().required('Benötigt.'),
  emailColumn: Yup.string().required('Benötigt.'),
  rolesColumn: Yup.string(),
  usernameColumn: Yup.string(),
  passwordColumn: Yup.string(),
});

function MapCSVColumnsContent(): JSX.Element {
  const classes = useStyles();

  const { values, isValid } = useFormikContext<MappedColumns>();
  const { setNextCallback, removeNextCallback, setNextDisabled } = useStepper();
  const {
    data: { headers },
    setMappedColumns,
  } = useImportDataContext();

  useEffect(() => {
    setNextDisabled(!isValid);
  }, [isValid, setNextDisabled]);

  useEffect(() => {
    setNextCallback(async () => {
      if (!isValid) {
        return { goToNext: false, error: true };
      }

      setMappedColumns(values);
      return { goToNext: true };
    });

    return removeNextCallback;
  }, [setNextCallback, removeNextCallback, values, setMappedColumns, isValid]);

  return (
    <Box display='flex' flexDirection='column' padding={1}>
      <Typography variant='h4'>Spalten zuordnen</Typography>

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

      <FormikDebugDisplay showErrors />
    </Box>
  );
}

function MapCSVColumns(): JSX.Element {
  const { mappedColumns } = useImportDataContext();
  const { nextStep } = useStepper();

  return (
    <Formik
      initialValues={mappedColumns}
      validationSchema={validationSchema}
      onSubmit={() => nextStep()}
    >
      <MapCSVColumnsContent />
    </Formik>
  );
}

export default MapCSVColumns;
