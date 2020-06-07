import { Box, Tab, Tabs, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik } from 'formik';
import { DateTime, Interval } from 'luxon';
import React, { useEffect, useState } from 'react';
import FormikDatePicker from '../../../components/forms/components/FormikDatePicker';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import TabPanel from '../../../components/TabPanel';
import FormikExcludedDates, {
  FormExcludedDate,
} from './components/excluded-dates/FormikExcludedDates';
import FormikWeekdaySlot from './components/FormikWeekdaySlot';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: {
      flex: 1,
    },
    weekdayEntry: {
      padding: theme.spacing(1),
      display: 'flex',
      marginTop: theme.spacing(1),
      alignItems: 'center',
      '&:first-of-type': {
        marginTop: 0,
      },
    },
  })
);

interface WeekdayTimeSlot {
  _id: number;
  interval: string;
  count: string;
}

interface FormState {
  startDate: string;
  endDate: string;
  excludedDates: FormExcludedDate[];
  weekdays: { [day: string]: WeekdayTimeSlot[] };
}

function GenerateTutorials(): JSX.Element {
  const classes = useStyles();
  const { setNextCallback, removeNextCallback, setNextDisabled } = useStepper();
  const [selectedTab, setSelectedTab] = useState(0);
  const initialValues: FormState = {
    startDate: DateTime.local().toISODate(),
    endDate: DateTime.local().toISODate(),
    excludedDates: [
      DateTime.fromISO('2020-06-04'),
      Interval.fromDateTimes(
        DateTime.local().minus({ days: 1 }),
        DateTime.local().plus({ days: 4 })
      ),
    ],
    weekdays: {
      monday: [
        { _id: 0, interval: DateTime.local().toISO(), count: '3' },
        { _id: 1, interval: DateTime.local().toISO(), count: '3' },
        { _id: 2, interval: DateTime.local().toISO(), count: '3' },
        { _id: 3, interval: DateTime.local().toISO(), count: '3' },
        { _id: 4, interval: DateTime.local().toISO(), count: '3' },
        { _id: 5, interval: DateTime.local().toISO(), count: '3' },
      ],
    },
  };

  const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    setNextDisabled(true);
    setTimeout(() => setNextDisabled(false), 10000);

    console.log('GenerateTutorials - registering next callback');
    const callback = async () => {
      console.log('Next clicked');
      return new Promise<NextStepInformation>((resolve) => {
        setTimeout(() => resolve({ goToNext: true }), 2000);
      });
    };

    setNextCallback(callback);

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, setNextDisabled]);

  // FIXME: Add proper onSubmit handler.
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {({ values, errors, getFieldProps }) => (
        <form className={classes.form}>
          <Box
            display='grid'
            gridTemplateColumns='1fr 3fr'
            gridTemplateRows='30px repeat(2, 60px) 1fr'
            gridRowGap={16}
            gridColumnGap={16}
            height='100%'
          >
            <Typography variant='h6'>Terminbereich</Typography>

            <FormikDatePicker name='startDate' label='Startdatum' />

            <FormikDatePicker name='endDate' label='Enddatum' />

            <FormikExcludedDates name='excludedDates' gridColumn='2' gridRow='1 / span 3' />

            <Box
              gridArea='4 / 1 / span 1 / span 2'
              border={2}
              borderColor='divider'
              padding={1}
              marginBottom={1}
            >
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant='scrollable'
                scrollButtons='auto'
              >
                <Tab label='Montag' />
                <Tab label='Dienstag' />
                <Tab label='Mittwoch' />
                <Tab label='Donnerstag' />
                <Tab label='Freitag' />
                <Tab label='Samstag' />
              </Tabs>

              <TabPanel index={0} value={selectedTab}>
                <Box display='flex' flexDirection='column'>
                  {getFieldProps<WeekdayTimeSlot[]>(`weekdays.${'monday'}`).value.map(
                    (val, idx) => (
                      <FormikWeekdaySlot
                        key={val._id}
                        namePrefix={`weekdays.${'monday'}[${idx}]`}
                        className={classes.weekdayEntry}
                      />
                    )
                  )}
                </Box>
              </TabPanel>
              <TabPanel index={1} value={selectedTab}>
                TUESDAY PANEL
              </TabPanel>
              <TabPanel index={2} value={selectedTab}>
                WEDNESDAY PANEL
              </TabPanel>
              <TabPanel index={3} value={selectedTab}>
                THURSDAY PANEL
              </TabPanel>
              <TabPanel index={4} value={selectedTab}>
                FRIDAY PANEL
              </TabPanel>
              <TabPanel index={5} value={selectedTab}>
                SATURDAY PANEL
              </TabPanel>
            </Box>
          </Box>

          <FormikDebugDisplay values={values} errors={errors} />
        </form>
      )}
    </Formik>
  );
}

export default GenerateTutorials;
