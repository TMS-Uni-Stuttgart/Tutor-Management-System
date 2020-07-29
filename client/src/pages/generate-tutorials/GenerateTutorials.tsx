import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik, useFormikContext } from 'formik';
import { DateTime, Interval } from 'luxon';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router';
import { ITutorialGenerationData, ITutorialGenerationDTO, Weekday } from 'shared/model/Tutorial';
import BackButton from '../../components/back-button/BackButton';
import FormikDatePicker from '../../components/forms/components/FormikDatePicker';
import FormikDebugDisplay from '../../components/forms/components/FormikDebugDisplay';
import SubmitButton from '../../components/loading/SubmitButton';
import OutlinedBox from '../../components/OutlinedBox';
import { createMultipleTutorials } from '../../hooks/fetching/Tutorial';
import { ROUTES } from '../../routes/Routing.routes';
import { FormikSubmitCallback } from '../../types';
import FormikExcludedDates, {
  FormExcludedDate,
} from './components/excluded-dates/FormikExcludedDates';
import { WeekdayTimeSlot } from './components/weekday-slots/FormikWeekdaySlot';
import WeekdayTabs from './components/weekday-slots/WeekdayTabs';
import { validationSchema } from './GenerateTutorials.validation';

const useStyles = makeStyles((theme) =>
  createStyles({
    backButton: {
      marginRight: theme.spacing(1),
    },
    form: {
      flex: 1,
    },
    errorLabel: {
      marginBottom: theme.spacing(1),
    },
  })
);

export interface FormState {
  startDate: string;
  endDate: string;
  excludedDates: FormExcludedDate[];
  weekdays: { [day: string]: WeekdayTimeSlot[] };
  prefixes: { [day: string]: string };
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

function generateDTOFromValues(values: FormState): ITutorialGenerationDTO {
  const { startDate, endDate, excludedDates, weekdays, prefixes } = values;

  return {
    firstDay: DateTime.fromISO(startDate).toISODate() ?? 'DATE_NOTE_PARSEABLE',
    lastDay: DateTime.fromISO(endDate).toISODate() ?? 'DATE_NOTE_PARSEABLE',
    excludedDates: excludedDates.map((ex) => {
      if (ex instanceof DateTime) {
        return { date: ex.toISODate() ?? 'DATE_NOTE_PARSEABLE' };
      } else if (ex instanceof Interval) {
        if (ex.start.day === ex.end.day) {
          return { date: ex.start.toISODate() ?? 'DATE_NOTE_PARSEABLE' };
        } else {
          return { interval: ex.toISODate() ?? 'DATE_NOTE_PARSEABLE' };
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
            prefix: prefixes[key] ?? `${key.charAt(0).toUpperCase() + key.charAt(1).toLowerCase()}`,
            amount: Number.parseInt(day.count),
            interval: day.interval.toISOTime(),
          };
        });

        return [...dataOfWeekday];
      })
      .flat(),
  };
}

function GenerateTutorialsContent(): JSX.Element {
  const classes = useStyles();
  const { handleSubmit, isSubmitting, isValid, errors } = useFormikContext<FormState>();

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <Box
        display='grid'
        gridTemplateColumns='minmax(255px, 340px) minmax(0, 1fr)'
        gridTemplateRows='32px repeat(2, 60px) 1fr'
        gridRowGap={16}
        gridColumnGap={16}
        height='100%'
      >
        <Box display='flex'>
          <BackButton to={ROUTES.MANAGE_TUTORIALS.create({})} className={classes.backButton} />
          <Typography variant='h6'>Terminbereich</Typography>
        </Box>

        <FormikDatePicker name='startDate' label='Startdatum' />

        <FormikDatePicker name='endDate' label='Enddatum' />

        <FormikExcludedDates name='excludedDates' gridColumn='1' gridRow='4' />

        <Box gridColumn='1' gridRow='5' display='flex' flexDirection='column'>
          {errors.weekdays && (
            <Typography color='error' className={classes.errorLabel}>
              {typeof errors.weekdays === 'string'
                ? errors.weekdays
                : 'Keine gültige Slotkonfiguration.'}
            </Typography>
          )}

          <SubmitButton
            isSubmitting={isSubmitting}
            disabled={!isValid}
            variant='contained'
            color='primary'
            fullWidth
          >
            Tutorien generieren
          </SubmitButton>
        </Box>

        <OutlinedBox gridArea='1 / 2 / span 5 / span 1'>
          <WeekdayTabs />
        </OutlinedBox>
      </Box>

      <FormikDebugDisplay disabled showErrors />
    </form>
  );
}

const initialPrefixes = {
  monday: 'Mo',
  tuesday: 'Di',
  wednesday: 'Mi',
  thursday: 'Do',
  friday: 'Fr',
  saturday: 'Sa',
};

function GenerateTutorials(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const initialValues: FormState = {
    startDate: DateTime.local().toISODate() ?? '',
    endDate: DateTime.local().plus({ days: 1 }).toISODate() ?? '',
    excludedDates: [],
    weekdays: {},
    prefixes: initialPrefixes,
  };

  const onSubmit: FormikSubmitCallback<FormState> = async (values, helpers) => {
    const dto: ITutorialGenerationDTO = generateDTOFromValues(values);

    // Manually validate the form to get a response. Formik's submitForm() does not respond in a manner to check if inner validation succeded or failed.
    const errors = await helpers.validateForm();

    if (Object.entries(errors).length > 0) {
      enqueueSnackbar('Ungültige Formulardaten.', { variant: 'error' });
      return;
    }

    try {
      const response = await createMultipleTutorials(dto);

      enqueueSnackbar(`${response.length} Tutorien wurden erfolgreich generiert.`, {
        variant: 'success',
      });

      history.push(ROUTES.MANAGE_TUTORIALS.create({}));
    } catch (err) {
      enqueueSnackbar('Tutorien konnten nicht generiert werden.', { variant: 'error' });
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      <GenerateTutorialsContent />
    </Formik>
  );
}

export default GenerateTutorials;
