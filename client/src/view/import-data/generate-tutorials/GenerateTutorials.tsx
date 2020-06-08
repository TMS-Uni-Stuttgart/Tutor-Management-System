import { Box, Tab, Tabs, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import FormikDatePicker from '../../../components/forms/components/FormikDatePicker';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import TabPanel from '../../../components/TabPanel';
import FormikExcludedDates, {
  FormExcludedDate,
} from './components/excluded-dates/FormikExcludedDates';
import { WeekdayTimeSlot } from './components/FormikWeekdaySlot';
import WeekdayBox from './components/weekday-slots/WeekdayBox';

const useStyles = makeStyles(() =>
  createStyles({
    form: {
      flex: 1,
    },
  })
);

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
    excludedDates: [],
    weekdays: {},
  };

  const handleTabChange = (_: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    // TODO: Implement correct logic.
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
      {({ handleSubmit }) => (
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
                <WeekdayBox name={'weekdays.monday'} />
              </TabPanel>
              <TabPanel index={1} value={selectedTab}>
                <WeekdayBox name={'weekdays.tuesday'} />
              </TabPanel>
              <TabPanel index={2} value={selectedTab}>
                <WeekdayBox name={'weekdays.wednesday'} />
              </TabPanel>
              <TabPanel index={3} value={selectedTab}>
                <WeekdayBox name={'weekdays.thursday'} />
              </TabPanel>
              <TabPanel index={4} value={selectedTab}>
                <WeekdayBox name={'weekdays.friday'} />
              </TabPanel>
              <TabPanel index={5} value={selectedTab}>
                <WeekdayBox name={'weekdays.saturday'} />
              </TabPanel>
            </Box>
          </Box>
        </form>
      )}
    </Formik>
  );
}

export default GenerateTutorials;
