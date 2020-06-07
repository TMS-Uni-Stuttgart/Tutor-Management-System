import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Tab,
  Tabs,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DatePicker } from '@material-ui/pickers';
import { DateTime, Interval } from 'luxon';
import React, { useState } from 'react';
import TabPanel from '../../../../components/TabPanel';
import { FormExcludedDate } from './FormikExcludedDates';

const useStyles = makeStyles(() =>
  createStyles({
    tabContent: { display: 'flex' },
  })
);

interface Props extends DialogProps {
  excluded?: FormExcludedDate;
  onAccept: (excluded: FormExcludedDate) => void;
}

interface ValueState {
  single: DateTime;
  interval: Interval;
}

function getDefaultValue(): ValueState {
  return {
    single: DateTime.local(),
    interval: Interval.fromDateTimes(DateTime.local(), DateTime.local().plus({ days: 7 })),
  };
}

function ExcludedDateDialog({ excluded, onClose, onAccept, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [value, setValue] = useState<ValueState>(getDefaultValue);
  const [selected, setSelected] = useState(0);

  const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setSelected(newValue);
  };

  return (
    <Dialog fullWidth onClose={onClose} {...props}>
      <DialogTitle>Zeitspanne ausschließen</DialogTitle>

      <DialogContent>
        <Tabs value={selected} onChange={handleTabChange} variant='fullWidth'>
          <Tab label='Einzelner Tag' />
          <Tab label='Zeitspanne' />
        </Tabs>

        <TabPanel index={0} value={selected} className={classes.tabContent}>
          <DatePicker
            label='Tag'
            value={value.single}
            variant='inline'
            format='EEE, dd MMMM yyyy'
            autoOk
            fullWidth
            inputVariant='outlined'
            onChange={(date) => {
              if (!!date) {
                setValue({ ...value, single: date });
              }
            }}
          />
        </TabPanel>
        <TabPanel index={1} value={selected} className={classes.tabContent}>
          <DatePicker
            label='Von'
            value={value.interval.start}
            variant='inline'
            format='EEE, dd MMMM yyyy'
            autoOk
            fullWidth
            inputVariant='outlined'
            onChange={(date) => {
              if (!!date) {
                const { interval } = value;
                const endDate = date <= interval.end ? interval.end : date.plus({ days: 7 });

                setValue({ ...value, interval: Interval.fromDateTimes(date, endDate) });
              }
            }}
          />
          <DatePicker
            label='Bis'
            value={value.interval.end}
            variant='inline'
            format='EEE, dd MMMM yyyy'
            autoOk
            fullWidth
            inputVariant='outlined'
            minDate={value.interval.start.plus({ days: 1 })}
            onChange={(date) => {
              const { interval } = value;
              if (!!date && date >= interval.start) {
                setValue({ ...value, interval: Interval.fromDateTimes(interval.start, date) });
              }
            }}
          />
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={(e) => {
            !!onClose && onClose(e, 'escapeKeyDown');
          }}
        >
          Abbrechen
        </Button>
        <Button
          color='primary'
          onClick={() => onAccept(selected === 0 ? value.single : value.interval)}
        >
          Bestätigen
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExcludedDateDialog;
