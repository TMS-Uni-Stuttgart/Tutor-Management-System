import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import CustomSelect from '../../../components/CustomSelect';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { useImportDataContext } from '../ImportData.context';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      minWidth: 210,
      marginTop: theme.spacing(1),
    },
  })
);

function ImportUsers(): JSX.Element {
  const classes = useStyles();

  const { setNextCallback, removeNextCallback } = useStepper();
  const [timesTried, setTimesTried] = useState(0);
  const {
    data: { headers },
  } = useImportDataContext();

  useEffect(() => {
    console.log('ImportUsers - registering next callback');
    const callback = () => {
      console.log('Other next clicked');
      return new Promise<NextStepInformation>((resolve) => {
        setTimeout(() => {
          if (timesTried === 0) {
            setTimesTried(1);
            resolve({ goToNext: false, error: true });
          } else {
            setTimesTried(0);
            resolve({ goToNext: true, error: false });
          }
        }, 2000);
      });
    };

    setNextCallback(callback);

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, timesTried]);

  return (
    <Box display='flex' flex={1}>
      <Box display='flex' flexDirection='column' padding={1}>
        <Typography>Spalten zuordnen</Typography>

        <CustomSelect
          label='Vorname'
          required
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <CustomSelect
          label='Nachname'
          required
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <CustomSelect
          label='E-Mailadresse'
          required
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <CustomSelect
          label='Rollen'
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <CustomSelect
          label='Nutzername'
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />

        <CustomSelect
          label='Passwort'
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />
      </Box>

      <Box
        flex={1}
        marginLeft={2}
        border={2}
        borderColor='divider'
        borderRadius='borderRadius'
        padding={1}
      >
        <Typography>Nutzerdaten festlegen</Typography>
      </Box>
    </Box>
  );
}

export default ImportUsers;
