import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik, useFormikContext } from 'formik';
import { DateTime, Interval } from 'luxon';
import { useSnackbar } from 'notistack';
import React from 'react';
import { ITutorialGenerationData, ITutorialGenerationDTO, Weekday } from 'shared/model/Tutorial';
import FormikDatePicker from '../../components/forms/components/FormikDatePicker';
import FormikDebugDisplay from '../../components/forms/components/FormikDebugDisplay';
import { createMultipleTutorials } from '../../hooks/fetching/Tutorial';
import { FormikSubmitCallback } from '../../types';
import FormikExcludedDates, {
  FormExcludedDate,
} from './components/excluded-dates/FormikExcludedDates';
import { WeekdayTimeSlot } from './components/weekday-slots/FormikWeekdaySlot';
import WeekdayTabs from './components/weekday-slots/WeekdayTabs';
import { validationSchema } from './GenerateTutorials.validation';
import BackButton from '../../components/BackButton';
import { RoutingPath } from '../../routes/Routing.routes';
import SubmitButton from '../../components/loading/SubmitButton';
import { useHistory } from 'react-router';

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
  const { startDate, endDate, excludedDates, weekdays } = values;

  return {
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
            prefix: `${key.charAt(0).toUpperCase() + key.charAt(1).toLowerCase()}`, //FIXME: Add Prefixsettings!
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
          <BackButton to={RoutingPath.MANAGE_TUTORIALS} className={classes.backButton} />
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

        <Box
          gridArea='1 / 2 / span 5 / span 1'
          border={2}
          borderColor='divider'
          borderRadius='borderRadius'
          padding={1}
        >
          <WeekdayTabs />
        </Box>
      </Box>

      <FormikDebugDisplay disabled showErrors />
    </form>
  );
}

function GenerateTutorials(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const initialValues: FormState = {
    startDate: DateTime.local().toISODate(),
    endDate: DateTime.local().plus({ days: 1 }).toISODate(),
    excludedDates: [],
    weekdays: {},
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

      history.push(RoutingPath.MANAGE_TUTORIALS);
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
