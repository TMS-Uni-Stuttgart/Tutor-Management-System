import { Box, BoxProps, Grow, IconButton, TextField } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useFormik } from 'formik';
import { DateTime, Interval } from 'luxon';
import { Check as AcceptIcon, Close as AbortIcon } from 'mdi-material-ui';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
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

interface Props extends BoxProps {
  onAccept: (data: AddSlotFormData) => void;
  onAbort: () => void;
}

export interface AddSlotFormData {
  interval: Interval;
  count: number;
}

const validationSchema = Yup.object().shape<AddSlotFormData>({
  count: Yup.number().min(1, 'Anzahl muss größer als 0 sein.').required('Benötigt'),
  interval: Yup.object<Interval>()
    .test('is-interval', 'Ist kein Luxon Interval', (obj) => obj instanceof Interval && obj.isValid)
    .required('Benötigt'),
});

function getDefaultInterval(): Interval {
  const currentTime = DateTime.local().startOf('minute');
  return Interval.fromDateTimes(currentTime, currentTime.plus({ minutes: 90 }));
}

function AddSlotForm({ onAbort, onAccept, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const initialValues: AddSlotFormData = useMemo(
    () => ({ interval: getDefaultInterval(), count: 1 }),
    []
  );
  const {
    values,
    errors,
    touched,
    setFieldValue,
    getFieldProps,
    isValid,
    submitForm,
  } = useFormik<AddSlotFormData>({
    initialValues,
    onSubmit: ({ count, interval }) => {
      onAccept({ count, interval });
    },
    validationSchema,
  });

  const handleAccept = () => {
    submitForm();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAccept();
    }
  };

  return (
    <Grow in style={{ transformOrigin: 'center center 0' }} timeout={500}>
      <Box
        padding={1}
        display='flex'
        alignItems='center'
        justifyContent='center'
        onKeyDown={handleKeyDown}
        {...props}
      >
        <SelectInterval
          mode={SelectIntervalMode.TIME}
          autoIncreaseStep={90}
          value={values.interval}
          onChange={(i) => setFieldValue('interval', i)}
        />

        <TextField
          type='number'
          className={classes.weekdayCountField}
          fullWidth
          variant='outlined'
          label='Anzahl'
          {...getFieldProps('count')}
          error={!!touched.count && !!errors.count}
          helperText={!!touched.count && errors.count}
        />

        <IconButton onClick={handleAccept} disabled={!isValid}>
          <AcceptIcon />
        </IconButton>

        <IconButton onClick={onAbort}>
          <AbortIcon />
        </IconButton>
      </Box>
    </Grow>
  );
}

export default AddSlotForm;
