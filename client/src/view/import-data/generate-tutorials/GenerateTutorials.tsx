import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik, useFormikContext } from 'formik';
import { DateTime, Interval } from 'luxon';
import React, { useEffect } from 'react';
import { ITutorialGenerationData, ITutorialGenerationDTO, Weekday } from 'shared/model/Tutorial';
import FormikDatePicker from '../../../components/forms/components/FormikDatePicker';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';
import { FormikSubmitCallback } from '../../../types';
import FormikExcludedDates, {
  FormExcludedDate,
} from './components/excluded-dates/FormikExcludedDates';
import { WeekdayTimeSlot } from './components/weekday-slots/FormikWeekdaySlot';
import WeekdayTabs from './components/weekday-slots/WeekdayTabs';
import { validationSchema } from './GenerateTutorials.validation';

const useStyles = makeStyles(() =>
  createStyles({
    form: {
      flex: 1,
    },
  })
);

export interface FormState {
  startDate: string;
  endDate: string;
  excludedDates: FormExcludedDate[];
  weekdays: { [day: string]: WeekdayTimeSlot[] };
}

function mapKeyToWeekday(key: string): Weekday {
  switch (key.toLowerCase()) {
    case 'monday':
      return Weekday.MONDAY;
    case 'tuesday':
      return Weekday.TUESDAY;
    case 'wednesday':
      return Weekday.WEDNESDAY;
    case 'thursday':
      return Weekday.THURSDAY;
    case 'friday':
      return Weekday.FRIDAY;
    case 'saturday':
      return Weekday.SATURDAY;
    case 'sunday':
      return Weekday.SUNDAY;
    default:
      throw new Error(`No weekday mapped to given key '${key}'`);
  }
}

function GenerateTutorialsContent(): JSX.Element {
  const classes = useStyles();

  const { setNextCallback, removeNextCallback, setNextDisabled } = useStepper();
  const { submitForm } = useFormikContext<FormState>();

  useEffect(() => {
    // TODO: Implement correct logic.
    setNextCallback(async () => {
      await submitForm();
      return { goToNext: false };
    });

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, setNextDisabled, submitForm]);

  return (
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
          <WeekdayTabs />
        </Box>
      </Box>

      <FormikDebugDisplay showErrors />
    </form>
  );
}

function GenerateTutorials(): JSX.Element {
  const initialValues: FormState = {
    startDate: DateTime.local().toISODate(),
    endDate: DateTime.local().plus({ days: 1 }).toISODate(),
    excludedDates: [],
    weekdays: {},
  };

  const onSubmit: FormikSubmitCallback<FormState> = async (values, helpers) => {
    // FIXME: Add proper onSubmit handler.
    const { startDate, endDate, excludedDates, weekdays } = values;

    // TODO: Split me up / extract me into function(s)
    const dto: ITutorialGenerationDTO = {
      firstDay: DateTime.fromISO(startDate).toISODate(),
      lastDay: DateTime.fromISO(endDate).toISODate(),
      excludedDates: excludedDates.map((ex) => {
        if (ex instanceof DateTime) {
          return { date: ex.toISODate() };
        } else if (ex instanceof Interval) {
          if (ex.start.day === ex.end.day) {
            return { date: ex.start.toISODate() };
          } else {
            return { interval: ex.toISODate() };
          }
        } else {
          throw new Error('Given excluded date is neither a DateTime nor an Interval');
        }
      }),
      generationDatas: Object.entries(weekdays)
        .map(([key, val]) => {
          const dataOfWeekday: ITutorialGenerationData[] = val.map((day) => {
            return {
              weekday: mapKeyToWeekday(key),
              prefix: 'PREFIX', //FIXME: Add Prefixsettings!
              amount: Number.parseInt(day.count),
              interval: day.interval.toISOTime(),
            };
          });

          return [...dataOfWeekday];
        })
        .flat(),
    };

    // TODO: Real request to the server & response handling!
    console.log('BEFORE TIMEOUT');
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 5000);
    });
    console.log('AFTER TIMEOUT');

    console.log(JSON.stringify(dto, null, 2));
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      <GenerateTutorialsContent />
    </Formik>
  );
}

export default GenerateTutorials;
