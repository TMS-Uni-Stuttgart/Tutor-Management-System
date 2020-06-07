import { IconButton, Paper, PaperProps } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Delete as DeleteIcon } from 'mdi-material-ui';
import React from 'react';
import FormikTextField from '../../../../components/forms/components/FormikTextField';
import FormikTimePicker from '../../../../components/forms/components/FormikTimePicker';

const useStyles = makeStyles((theme) =>
  createStyles({
    weekdayCountField: {
      margin: theme.spacing(0, 2),
    },
    weekdayEntryDeleteButton: {
      color: theme.palette.red.main,
    },
  })
);

interface Props extends PaperProps {
  namePrefix: string;
}

function FormikWeekdaySlot({ namePrefix, ...props }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Paper {...props}>
      <FormikTimePicker name={`${namePrefix}.interval`} label='Anzahl' />
      <FormikTextField
        name={`${namePrefix}.count`}
        label='Anzahl'
        className={classes.weekdayCountField}
      />
      <IconButton className={classes.weekdayEntryDeleteButton}>
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}

export default FormikWeekdaySlot;
