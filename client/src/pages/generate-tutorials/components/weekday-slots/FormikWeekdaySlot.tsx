import { IconButton, Paper, PaperProps } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';
import { Interval } from 'luxon';
import { Delete as DeleteIcon } from 'mdi-material-ui';
import React from 'react';
import FormikTextField from '../../../../components/forms/components/FormikTextField';
import SelectInterval, {
  SelectIntervalMode,
} from '../../../../components/select-interval/SelectInterval';

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

export interface WeekdayTimeSlot {
  _id: number;
  interval: Interval;
  count: string;
}

interface Props extends PaperProps {
  name: string;
  onDelete: () => void;
}

function FormikWeekdaySlot({ name, onDelete, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [, meta, helpers] = useField<WeekdayTimeSlot>(name);
  const { value } = meta;

  const handleIntervalChanged = (interval: Interval) => {
    helpers.setValue({ ...value, interval });
  };

  return (
    <Paper {...props}>
      <SelectInterval
        mode={SelectIntervalMode.TIME}
        autoIncreaseStep={90}
        value={value.interval}
        onChange={handleIntervalChanged}
      />

      <FormikTextField
        name={`${name}.count`}
        label='Anzahl'
        type='number'
        className={classes.weekdayCountField}
      />

      <IconButton className={classes.weekdayEntryDeleteButton} onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}

export default FormikWeekdaySlot;
