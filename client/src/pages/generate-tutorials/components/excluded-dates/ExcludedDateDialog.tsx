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
import { DateTime, Interval } from 'luxon';
import React, { useState } from 'react';
import CustomDatePicker from '../../../../components/date-picker/DatePicker';
import SelectInterval, {
  SelectIntervalMode,
} from '../../../../components/select-interval/SelectInterval';
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

function getDefaultValue(excluded?: FormExcludedDate): ValueState {
  const defaultSingle = DateTime.local();
  const defaultInterval = Interval.fromDateTimes(
    DateTime.local(),
    DateTime.local().plus({ days: 7 })
  );

  if (excluded instanceof DateTime) {
    return { single: excluded, interval: defaultInterval };
  }

  if (excluded instanceof Interval) {
    return {
      single: defaultSingle,
      interval: Interval.fromDateTimes(excluded.start, excluded.end),
    };
  }

  return { single: defaultSingle, interval: defaultInterval };
}

function getSelectedTab(excluded?: FormExcludedDate): number {
  if (excluded instanceof DateTime) {
    return 0;
  }

  if (excluded instanceof Interval) {
    return 1;
  }

  return 0;
}

function ExcludedDateDialog({ excluded, onClose, onAccept, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [value, setValue] = useState<ValueState>(() => getDefaultValue(excluded));
  const [selected, setSelected] = useState(() => getSelectedTab(excluded));

  const handleTabChange = (_: React.ChangeEvent<unknown>, newValue: number) => {
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
          <CustomDatePicker
            label='Tag'
            value={value.single}
            fullWidth
            onChange={(date) => {
              if (!!date) {
                setValue({ ...value, single: date });
              }
            }}
          />
        </TabPanel>
        <TabPanel index={1} value={selected} className={classes.tabContent}>
          <SelectInterval
            value={value.interval}
            flex='1'
            autoIncreaseStep={6}
            mode={SelectIntervalMode.DATE}
            onChange={(interval) => {
              setValue({ ...value, interval });
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
