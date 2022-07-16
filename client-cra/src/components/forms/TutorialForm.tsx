import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DateTime } from 'luxon';
import React from 'react';
import { Role } from 'shared/model/Role';
import { IUser } from 'shared/model/User';
import * as Yup from 'yup';
import { Tutorial } from '../../model/Tutorial';
import { FormikSubmitCallback } from '../../types';
import { compareDateTimes } from '../../util/helperFunctions';
import FormikDatePicker from './components/FormikDatePicker';
import FormikMultipleDatesPicker from './components/FormikMultipleDatesPicker';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import FormikTimePicker from './components/FormikTimePicker';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    correctorsDropdown: {
      gridColumn: '1 / span 2',
    },
    twoPickerContainer: {
      display: 'flex',
    },
    dateSelector: {
      display: 'flex',
      gridColumn: '2',
      gridRow: '1 / span 5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    startDateField: {
      '& fieldset': {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
    },
    endDateField: {
      '& fieldset': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderLeftColor: 'transparent',
      },
      '& *:focus': {
        borderLeftColor: theme.palette.primary.main,
      },
    },
    textFieldWithMargin: {
      marginBottom: theme.spacing(2),
    },
  })
);

export interface TutorialFormState {
  slot: string;
  tutor: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  correctors: string[];
  selectedDates: string[];
}

const validationSchema = Yup.object().shape({
  slot: Yup.string().required('Benötigt'),
  startDate: Yup.string().required('Benötigt'),
  endDate: Yup.string()
    .required('Benötigt')
    .test({
      test: function (this, date: unknown) {
        if (typeof date !== 'string') {
          return this.createError({
            message: 'Muss eine Zeichenkette sein.',
          });
        }

        const startDate: DateTime = DateTime.fromISO(this.resolve(Yup.ref('startDate')));
        const endDate: DateTime = DateTime.fromISO(date);

        return startDate.toMillis() < endDate.toMillis();
      },
      message: 'Muss größer als Startdatum sein.',
    }),
  startTime: Yup.string().required('Benötigt'),
  endTime: Yup.string()
    .nullable()
    .required('Benötigt')
    .test({
      test: function (this, time: unknown) {
        if (typeof time !== 'string') {
          return this.createError({
            message: 'Muss eine Zeichenkette sein.',
          });
        }

        const startTime: DateTime = DateTime.fromISO(this.resolve(Yup.ref('startTime')));
        const endTime: DateTime = DateTime.fromISO(time);

        return startTime.toMillis() < endTime.toMillis();
      },
      message: 'Muss größer als Startzeit sein.',
    }),
});

export type TutorialFormSubmitCallback = FormikSubmitCallback<TutorialFormState>;

interface Props extends Omit<FormikBaseFormProps<TutorialFormState>, CommonlyUsedFormProps> {
  tutors: IUser[];
  correctors: IUser[];
  tutorial?: Tutorial;
  onSubmit: TutorialFormSubmitCallback;
}

function getAllWeeklyDatesBetween(startDate: DateTime, endDate: DateTime): DateTime[] {
  const dates: DateTime[] = [startDate];
  let currentDate: DateTime = startDate.plus({ weeks: 1 });

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = currentDate.plus({ weeks: 1 });
  }

  return dates;
}

export function getInitialTutorialFormValues(tutorial?: Tutorial): TutorialFormState {
  const startDate = DateTime.local().toISODate() ?? '';
  const endDate = DateTime.local().toISODate() ?? '';

  if (!tutorial) {
    return {
      slot: '',
      tutor: '',
      startDate,
      endDate,
      startTime: DateTime.local().toISO() ?? '',
      endTime: DateTime.local().toISO() ?? '',
      correctors: [],
      selectedDates: [],
    };
  }

  const sortedDates: DateTime[] = tutorial.dates.sort(compareDateTimes);

  return {
    slot: tutorial.slot,
    tutor: tutorial.tutor ? tutorial.tutor.id : '',
    startDate: sortedDates[0] ? sortedDates[0].toISODate() ?? '' : startDate,
    endDate: sortedDates[sortedDates.length - 1]
      ? sortedDates[sortedDates.length - 1].toISODate() ?? ''
      : endDate,
    startTime: tutorial.startTime.toISO() ?? '',
    endTime: tutorial.endTime.toISO() ?? '',
    correctors: tutorial.correctors.map((c) => c.id),
    selectedDates: tutorial.dates.map((DateTime) => DateTime.toISODate() ?? '').filter(Boolean),
  };
}

function TutorialForm({
  tutors,
  correctors,
  tutorial,
  onSubmit,
  className,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();

  const initialFormValues: TutorialFormState = getInitialTutorialFormValues(tutorial);

  const userConverterFunctions = {
    itemToString: (tutor: IUser) => `${tutor.lastname}, ${tutor.firstname}`,
    itemToValue: (tutor: IUser) => tutor.id,
  };

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableDebug
    >
      {({ values, setFieldValue, touched }) => (
        <>
          <FormikTextField name='slot' label='Slot' required />

          <FormikSelect
            name='tutor'
            label='Tutor'
            emptyPlaceholder='Keine Tutoren vorhanden.'
            items={tutors.filter((tutor) => tutor.roles.indexOf(Role.TUTOR) > -1)}
            {...userConverterFunctions}
          />

          <div className={classes.twoPickerContainer}>
            <FormikDatePicker
              name='startDate'
              label='Startdatum'
              required
              className={classes.startDateField}
              onAccept={(date: MaterialUiPickersDate) => {
                if (date) {
                  let endDate = DateTime.fromISO(values.endDate);

                  if (!touched.endDate) {
                    endDate = date.plus({ weeks: 12 });
                    setFieldValue('endDate', endDate.toISODate());
                  }

                  const dates: DateTime[] = getAllWeeklyDatesBetween(date, endDate);

                  setFieldValue(
                    'selectedDates',
                    dates.map((date) => date.toISODate())
                  );
                }
              }}
            />

            <FormikDatePicker
              name='endDate'
              label='Enddatum'
              required
              className={classes.endDateField}
              onAccept={(date: MaterialUiPickersDate) => {
                if (date) {
                  const dates: DateTime[] = getAllWeeklyDatesBetween(
                    DateTime.fromISO(values.startDate),
                    date
                  );

                  setFieldValue(
                    'selectedDates',
                    dates.map((date) => date.toISODate())
                  );
                }
              }}
            />
          </div>

          <div className={classes.twoPickerContainer}>
            <FormikTimePicker
              name='startTime'
              label='Startuhrzeit'
              required
              className={classes.startDateField}
              onChange={(time: MaterialUiPickersDate) => {
                if (time) {
                  setFieldValue('endTime', time.plus({ hours: 1, minutes: 30 }).toISO());
                }
              }}
            />

            <FormikTimePicker
              name='endTime'
              label='Enduhrzeit'
              required
              className={classes.endDateField}
            />
          </div>

          <FormikSelect
            name='correctors'
            label='Korrektoren'
            emptyPlaceholder='Keine Korrektoren vorhanden.'
            items={correctors}
            {...userConverterFunctions}
            multiple
            isItemSelected={(corrector) => values['correctors'].indexOf(corrector.id) > -1}
            fullWidth
          />

          <div className={classes.dateSelector}>
            <FormikMultipleDatesPicker name='selectedDates' label='Ausgewählte Tage' />
          </div>
        </>
      )}
    </FormikBaseForm>
  );
}

export default TutorialForm;
