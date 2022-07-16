import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { ShortTest } from '../../model/ShortTest';
import { FormikSubmitCallback } from '../../types';
import FormikExerciseEditor, {
  ExerciseFormExercise,
  FormikExerciseEditorProps,
  mapExerciseToFormExercise,
} from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';
import { exerciseValidationSchema } from './SheetForm';

export type ShortTestFormSubmitCallback = FormikSubmitCallback<ShortTestFormState>;

export interface ShortTestFormState {
  shortTestNo: string;
  percentageNeeded: number;
  exercises: ExerciseFormExercise[];
}

const validationSchema = Yup.object().shape<ShortTestFormState>({
  shortTestNo: Yup.string().required('Benötigt'),
  percentageNeeded: Yup.number()
    .required('Benötigt')
    .min(0, 'Muss mind. 0% betragen.')
    .max(1, 'Darf höchstens 100% betragen.'),
  exercises: Yup.array<ExerciseFormExercise>()
    .of(exerciseValidationSchema)
    .required('Mind. 1 Aufgabe benötigt.'),
});

interface Props extends Omit<FormikBaseFormProps<ShortTestFormState>, CommonlyUsedFormProps> {
  onSubmit: ShortTestFormSubmitCallback;
  shortTest?: ShortTest;
  allShortTests?: ShortTest[];
  initialValues?: ShortTestFormState;
  children?: React.ReactNode;
  editorProps?: Omit<FormikExerciseEditorProps, 'name'>;
}

export function getInitialShortTestFormState(
  shortTest?: ShortTest,
  allShortTests?: ShortTest[]
): ShortTestFormState {
  const nextShortTestNo = (allShortTests?.length ?? 0) + 1;

  return {
    shortTestNo: shortTest?.shortTestNo.toString(10) ?? `${nextShortTestNo}`,
    percentageNeeded: shortTest?.percentageNeeded ?? 0.5,
    exercises: (shortTest?.exercises ?? []).map(mapExerciseToFormExercise),
  };
}

function ShortTestForm({
  onSubmit,
  shortTest,
  allShortTests,
  initialValues,
  children,
  editorProps,
  ...other
}: Props): JSX.Element {
  const initalFormState = useMemo(
    () =>
      !!initialValues ? initialValues : getInitialShortTestFormState(shortTest, allShortTests),
    [shortTest, allShortTests, initialValues]
  );

  return (
    <FormikBaseForm
      enableDebug
      {...other}
      initialValues={initalFormState}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
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

      <FormikExerciseEditor
        {...editorProps}
        name='exercises'
        disableAutofocus={!!editorProps?.disableAutofocus || !!shortTest}
      />

      {children}
    </FormikBaseForm>
  );
}

export default ShortTestForm;
