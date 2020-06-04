import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, Typography, Button, BoxProps, Paper } from '@material-ui/core';
import { useField } from 'formik';

const useStyles = makeStyles((theme) =>
  createStyles({
    addButton: {
      marginLeft: 'auto',
    },
    paper: {
      padding: theme.spacing(1),
    },
  })
);

export type FormExcludedDate = string;

interface Props extends BoxProps {
  name: string;
}

function FormikExcludedDates({ name, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [field, meta, helpers] = useField<FormExcludedDate[]>(name);
  const { value } = meta;
  const { setValue } = helpers;

  return (
    <Box
      border={2}
      borderColor='divider'
      borderRadius='borderRadius'
      padding={1}
      position='relative'
      display='flex'
      flexDirection='column'
      {...props}
    >
      <Box display='flex' marginBottom={1}>
        <Typography variant='h6'>Ausgeschlossene Zeitspannen</Typography>
        <Button
          variant='outlined'
          color='secondary'
          className={classes.addButton}
          onClick={() => {
            setValue([...value, `Eintrag: ${value.length + 1}`]);
          }}
        >
          Hinzufügen
        </Button>
      </Box>
      <Box
        overflow='auto'
        flex={1}
        display='grid'
        gridTemplateColumns='1fr 1fr'
        gridRowGap={8}
        gridColumnGap={8}
      >
        {value.map((val, idx) => (
          <Paper key={val + idx} elevation={2} className={classes.paper}>
            {val}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default FormikExcludedDates;
