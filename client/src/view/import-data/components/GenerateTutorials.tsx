import { Box, Button, Tab, Tabs, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import FormikDatePicker from '../../../components/forms/components/FormikDatePicker';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import TabPanel from '../../../components/TabPanel';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: {
      flex: 1,
    },
    addButton: {
      marginLeft: 'auto',
    },
  })
);

interface WeekdayTimeSlot {
  interval: string;
  count: number;
}

interface FormState {
  startDate: string;
  endDate: string;
  excludedDates: string[];
  weekdays: { [day: string]: WeekdayTimeSlot[] };
}

function GenerateTutorials(): JSX.Element {
  const classes = useStyles();
  const { setNextCallback, removeNextCallback } = useStepper();
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
    console.log('GenerateTutorials - registering next callback');
    const callback = async () => {
      console.log('Next clicked');
      return new Promise<NextStepInformation>((resolve) => {
        setTimeout(() => resolve({ goToNext: true }), 2000);
      });
    };

    setNextCallback(callback);

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback]);

  // FIXME: Add proper onSubmit handler.
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {({ values, errors }) => (
        <form className={classes.form}>
          <Box
            display='grid'
            gridTemplateColumns='1fr 3fr'
            gridTemplateRows='repeat(3, 60px) 1fr'
            gridRowGap={16}
            gridColumnGap={16}
            height='100%'
          >
            <FormikDatePicker name='startDate' label='Startdatum' />

            <Box
              border={2}
              borderColor='divider'
              borderRadius='borderRadius'
              gridRow='span 3'
              padding={1}
              position='relative'
              display='flex'
              flexDirection='column'
            >
              <Box display='flex' marginBottom={1}>
                <Typography variant='h6'>Ausgeschlossene Zeitspannen</Typography>
                <Button variant='outlined' color='secondary' className={classes.addButton}>
                  Hinzufügen
                </Button>
              </Box>
              <Box overflow='auto' flex={1}>
                EXCLUDED_SPANS_AREA
              </Box>
            </Box>

            <FormikDatePicker name='endDate' label='Enddatum' />

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
                MONDAY PANEL
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
