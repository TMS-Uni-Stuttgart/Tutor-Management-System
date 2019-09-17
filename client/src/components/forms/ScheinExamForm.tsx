import React from 'react';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { Exercise } from 'shared/dist/model/Sheet';
import { FormikSubmitCallback } from '../../types';
import FormikDatePicker from './components/FormikDatePicker';
import FormikExerciseEditor from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

export interface ScheinExamFormState {
  date: string;
  exercises: Exercise[];
  scheinExamNo: number;
  percentageNeeded: number;
}

export type ScheinExamFormSubmitCallback = FormikSubmitCallback<ScheinExamFormState>;

interface Props extends Omit<FormikBaseFormProps<ScheinExamFormState>, CommonlyUsedFormProps> {
  exam?: ScheinExam;
  onSubmit: ScheinExamFormSubmitCallback;
  exams?: ScheinExam[];
}

export function getInitialExamFormState(
  exam?: ScheinExam,
  exams?: ScheinExam[]
): ScheinExamFormState {
  if (!!exam) {
    return {
      ...exam,
      percentageNeeded: exam.percentageNeeded,
      // percentageNeeded: exam.percentageNeeded * 100,
      date: exam.date.toDateString(),
    };
  }

  let lastScheinExamNo = 0;
  if (exams) {
    lastScheinExamNo = exams.length;
  }

  return {
    scheinExamNo: lastScheinExamNo + 1,
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
