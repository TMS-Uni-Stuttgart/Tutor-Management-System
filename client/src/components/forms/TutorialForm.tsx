import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { addDays, addMinutes, addWeeks, compareAsc } from 'date-fns';
import React from 'react';
import * as Yup from 'yup';
import { FormikSubmitCallback } from '../../types';
import { Role, User } from '../../typings/ServerResponses';
import { TutorialWithFetchedCorrectors } from '../../typings/types';
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
  slot: number;
  tutor: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  correctors: string[];
  selectedDates: string[];
}

const validationSchema = Yup.object().shape({
  slot: Yup.number()
    .required('Benötigt')
    .min(0, 'Darf nicht negativ sein.'),
  startDate: Yup.string().required('Benötigt'),
  endDate: Yup.string()
    .required('Benötigt')
    .test({
      test: function(this, date: string) {
        const startDate: Date = new Date(this.resolve(Yup.ref('startDate')));
        const endDate: Date = new Date(date);

        return startDate.getTime() < endDate.getTime();
      },
      message: 'Muss größer als Startdatum sein.',
    }),
  startTime: Yup.string().required('Benötigt'),
  endTime: Yup.string()
    .required('Benötigt')
    .test({
      test: function(this, time: string) {
        const startTime: Date = new Date(this.resolve(Yup.ref('startTime')));
        const endTime: Date = new Date(time);

        return startTime.getTime() < endTime.getTime();
      },
      message: 'Muss größer als Startzeit sein.',
    }),
});

export type TutorialFormSubmitCallback = FormikSubmitCallback<TutorialFormState>;

interface Props extends Omit<FormikBaseFormProps<TutorialFormState>, CommonlyUsedFormProps> {
  tutors: User[];
  allTutorials: TutorialWithFetchedCorrectors[];
  tutorial?: TutorialWithFetchedCorrectors;
  onSubmit: TutorialFormSubmitCallback;
}

function getAllWeeklyDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [startDate];

  let currentDate: Date = addDays(startDate, 7);

  while (compareAsc(currentDate, endDate) <= 0) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 7);
  }

  return dates;
}

function findFirstEmptySlot(tutorials: { slot: number }[]): number {
  for (let i = 0; i <= tutorials.length; i++) {
    if (tutorials.findIndex(tut => tut.slot === i) === -1) {
      return i;
    }
  }

  return tutorials.length + 1;
}

export function getInitialTutorialFormValues(
  allTutorials: TutorialWithFetchedCorrectors[],
  tutorial?: TutorialWithFetchedCorrectors
): TutorialFormState {
  const startDate = new Date(Date.now()).toISOString();
  const endDate = new Date(Date.now()).toISOString();

  if (!tutorial) {
    return {
      slot: findFirstEmptySlot(allTutorials),
      tutor: '',
      startDate,
      endDate,
      startTime: new Date(Date.now()).toISOString(),
      endTime: new Date(addMinutes(Date.now(), 90)).toISOString(),
      correctors: [],
      selectedDates: [],
    };
  }

  const sortedDates: Date[] = tutorial.dates.sort((a, b) => a.getTime() - b.getTime());

  return {
    slot: tutorial.slot,
    tutor: tutorial.tutor ? tutorial.tutor.id : '',
    startDate: sortedDates[0] ? sortedDates[0].toISOString() : startDate,
    endDate: sortedDates[sortedDates.length - 1]
      ? sortedDates[sortedDates.length - 1].toISOString()
      : endDate,
    startTime: tutorial.startTime.toISOString(),
    endTime: tutorial.endTime.toISOString(),
    correctors: tutorial.correctors.map(corrector => corrector.id),
    selectedDates: tutorial.dates.map(date => date.toDateString()),
  };
}

function TutorialForm({
  tutors,
  tutorial,
  allTutorials,
  onSubmit,
  className,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();

  const initialFormValues: TutorialFormState = getInitialTutorialFormValues(allTutorials, tutorial);

  const userConverterFunctions = {
    itemToString: (tutor: User) => `${tutor.lastname}, ${tutor.firstname}`,
    itemToValue: (tutor: User) => tutor.id,
  };

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, touched }) => (
        <>
          <FormikTextField
            name='slot'
            label='Slot'
            type='number'
            inputProps={{
              min: 0,
            }}
          />

          <FormikSelect
            name='tutor'
            label='Tutor'
            emptyPlaceholder='Keine Tutoren vorhanden.'
            items={tutors.filter(tutor => tutor.roles.indexOf(Role.TUTOR) > -1)}
            {...userConverterFunctions}
          />

          <div className={classes.twoPickerContainer}>
            <FormikDatePicker
              name='startDate'
              label='Startdatum'
              className={classes.startDateField}
              onAccept={(date: MaterialUiPickersDate) => {
                if (date) {
                  let endDate = new Date(values.endDate);

                  if (!touched.endDate) {
                    endDate = addWeeks(date, 12);
                    setFieldValue('endDate', endDate.toDateString());
                  }

                  const dates: Date[] = getAllWeeklyDatesBetween(date, endDate);

                  setFieldValue('selectedDates', dates.map(date => date.toDateString()));
                }
              }}
            />

            <FormikDatePicker
              name='endDate'
              label='Enddatum'
              className={classes.endDateField}
              onAccept={(date: MaterialUiPickersDate) => {
                if (date) {
                  const dates: Date[] = getAllWeeklyDatesBetween(new Date(values.startDate), date);

                  setFieldValue('selectedDates', dates.map(date => date.toDateString()));
                }
              }}
            />
          </div>

          <div className={classes.twoPickerContainer}>
            <FormikTimePicker
              name='startTime'
              label='Startuhrzeit'
              className={classes.startDateField}
              onChange={(time: MaterialUiPickersDate) => {
                if (time) {
                  setFieldValue('endTime', addMinutes(time, 90).toISOString());
                }
              }}
            />

            <FormikTimePicker name='endTime' label='Enduhrzeit' className={classes.endDateField} />
          </div>

          <FormikSelect
            name='correctors'
            label='Korrektoren'
            emptyPlaceholder='Keine Korrektoren vorhanden.'
            items={tutors.filter(tutor => tutor.roles.indexOf(Role.CORRECTOR) > -1)}
            {...userConverterFunctions}
            multiple
            isItemSelected={tutor => values['correctors'].indexOf(tutor.id) > -1}
            fullWidth
            // className={classes.correctorsDropdown}
          />
          {/* </div> */}

          <div className={classes.dateSelector}>
            <FormikMultipleDatesPicker name='selectedDates' label='Ausgewählte Tage' />
          </div>
        </>
      )}
    </FormikBaseForm>
  );
}

export default TutorialForm;
