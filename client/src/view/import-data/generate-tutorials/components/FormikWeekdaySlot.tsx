import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, IconButton, PaperProps } from '@material-ui/core';
import FormikTimePicker from '../../../../components/forms/components/FormikTimePicker';
import FormikTextField from '../../../../components/forms/components/FormikTextField';
import { Delete as DeleteIcon } from 'mdi-material-ui';

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
