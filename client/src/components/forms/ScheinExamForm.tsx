import { DateTime } from 'luxon';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { Scheinexam } from '../../model/Scheinexam';
import { FormikSubmitCallback } from '../../types';
import FormikDatePicker from './components/FormikDatePicker';
import FormikExerciseEditor, {
  ExerciseFormExercise,
  mapExerciseToFormExercise,
} from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';
import { exerciseValidationSchema } from './SheetForm';

export interface ScheinExamFormState {
  date: string;
  exercises: ExerciseFormExercise[];
  scheinExamNo: string;
  percentageNeeded: number;
}

export type ScheinExamFormSubmitCallback = FormikSubmitCallback<ScheinExamFormState>;

const validationSchema = Yup.object().shape<ScheinExamFormState>({
  scheinExamNo: Yup.string().required('Benötigt'),
  percentageNeeded: Yup.number().required('Benötigt'),
  date: Yup.string().required('Benötigt'),
  exercises: Yup.array<ExerciseFormExercise>()
    .of(exerciseValidationSchema)
    .required('Mind. 1 Aufgabe benötigt.'),
});

interface Props extends Omit<FormikBaseFormProps<ScheinExamFormState>, CommonlyUsedFormProps> {
  exam?: Scheinexam;
  onSubmit: ScheinExamFormSubmitCallback;
  exams?: Scheinexam[];
}

export function getInitialExamFormState(
  exam?: Scheinexam,
  exams?: Scheinexam[]
): ScheinExamFormState {
  if (!!exam) {
    const exercises = exam.exercises.map(mapExerciseToFormExercise);

    return {
      scheinExamNo: exam.scheinExamNo.toString(),
      exercises,
      percentageNeeded: exam.percentageNeeded,
      date: exam.date.toISODate() ?? '',
    };
  }

  let lastScheinExamNo = 0;
  if (exams) {
    lastScheinExamNo = exams.length;
  }

  return {
    scheinExamNo: (lastScheinExamNo + 1).toString(),
    exercises: [],
    date: DateTime.local().toISODate() ?? '',
    percentageNeeded: 0.5,
  };
}

function ScheinExamForm({ onSubmit, className, exam, exams, ...other }: Props): JSX.Element {
  const initialFormState: ScheinExamFormState = useMemo(
    () => getInitialExamFormState(exam, exams),
    [exam, exams]
  );

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormState}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableDebug
    >
      {() => (
        <>
          <FormikTextField
            name='scheinExamNo'
            label='Nummer'
            type='number'
            inputProps={{ min: 1, step: 1 }}
          />

          <FormikTextField
            name='percentageNeeded'
            label='Bestehensgrenze'
            type='number'
            isPercentage
            inputProps={{ min: 0, max: 100, step: 1 }}
          />

          <FormikDatePicker name='date' label='Datum' />

          <FormikExerciseEditor name='exercises' disableAutofocus={!!exam} />
        </>
      )}
    </FormikBaseForm>
  );
}

export default ScheinExamForm;
