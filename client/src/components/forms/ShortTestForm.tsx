import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { ShortTest } from '../../model/ShortTest';
import { FormikSubmitCallback } from '../../types';
import FormikExerciseEditor, {
  ExerciseFormExercise,
  mapExerciseToFormExercise,
} from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm from './FormikBaseForm';
import { exerciseValidationSchema } from './SheetForm';

export type ShortTestFormSubmitCallback = FormikSubmitCallback<ShortTestFormState>;

interface ShortTestFormState {
  shortTestNo: string;
  percentageNeeded: number;
  exercises: ExerciseFormExercise[];
}

const validationSchema = Yup.object().shape<ShortTestFormState>({
  shortTestNo: Yup.string().required('Benötigt'),
  percentageNeeded: Yup.number().required('Benötigt'),
  exercises: Yup.array<ExerciseFormExercise>()
    .of(exerciseValidationSchema)
    .required('Mind. 1 Aufgabe benötigt.'),
});

interface Props {
  onSubmit: ShortTestFormSubmitCallback;
  shortTest?: ShortTest;
  allShortTests?: ShortTest[];
}

export function getInitialShortTestFormState(
  shortTest?: ShortTest,
  allShortTests?: ShortTest[]
): ShortTestFormState {
  const nextShortTestNo = (allShortTests?.length ?? 0) + 1;

  return {
    shortTestNo: shortTest?.shortTestNo ?? `${nextShortTestNo}`,
    percentageNeeded: shortTest?.percentageNeeded ?? 0.5,
    exercises: (shortTest?.exercises ?? []).map(mapExerciseToFormExercise),
  };
}

function ShortTestForm({ onSubmit, shortTest, allShortTests }: Props): JSX.Element {
  const initalFormState = useMemo(() => getInitialShortTestFormState(shortTest, allShortTests), [
    shortTest,
    allShortTests,
  ]);

  return (
    <FormikBaseForm
      initialValues={initalFormState}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableDebug
    >
      <FormikTextField
        name='shortTestNo'
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

      <FormikExerciseEditor name='exercises' disableAutofocus={!!shortTest} />
    </FormikBaseForm>
  );
}

export default ShortTestForm;
