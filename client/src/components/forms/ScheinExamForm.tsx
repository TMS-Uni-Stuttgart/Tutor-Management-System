import React from 'react';
import { IScheinExam } from 'shared/model/Scheinexam';
import { FormikSubmitCallback } from '../../types';
import FormikDatePicker from './components/FormikDatePicker';
import FormikExerciseEditor, {
  ExerciseFormExercise,
  mapExerciseToFormExercise,
} from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

export interface ScheinExamFormState {
  date: string;
  exercises: ExerciseFormExercise[];
  scheinExamNo: string;
  percentageNeeded: number;
}

export type ScheinExamFormSubmitCallback = FormikSubmitCallback<ScheinExamFormState>;

interface Props extends Omit<FormikBaseFormProps<ScheinExamFormState>, CommonlyUsedFormProps> {
  exam?: IScheinExam;
  onSubmit: ScheinExamFormSubmitCallback;
  exams?: IScheinExam[];
}

export function getInitialExamFormState(
  exam?: IScheinExam,
  exams?: IScheinExam[]
): ScheinExamFormState {
  if (!!exam) {
    const exercises = exam.exercises.map(mapExerciseToFormExercise);

    return {
      scheinExamNo: exam.scheinExamNo.toString(),
      exercises,
      percentageNeeded: exam.percentageNeeded,
      date: exam.date.toDateString(),
    };
  }

  let lastScheinExamNo = 0;
  if (exams) {
    lastScheinExamNo = exams.length;
  }

  return {
    scheinExamNo: (lastScheinExamNo + 1).toString(),
    exercises: [],
    date: new Date(Date.now()).toDateString(),
    percentageNeeded: 0.5,
  };
}

function ScheinExamForm({ onSubmit, className, exam, exams, ...other }: Props): JSX.Element {
  const initialFormState: ScheinExamFormState = getInitialExamFormState(exam, exams);

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormState}
      // validationSchema={validationSchema}
      onSubmit={onSubmit}
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
