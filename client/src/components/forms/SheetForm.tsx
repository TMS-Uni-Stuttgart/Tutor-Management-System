import React from 'react';
import { Sheet, Exercise } from 'shared/dist/model/Sheet';
import { FormikSubmitCallback } from '../../types';
import FormikCheckbox from './components/FormikCheckbox';
import FormikExerciseEditor from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

export type SheetFormSubmitCallback = FormikSubmitCallback<SheetFormState>;

export interface SheetFormExercise {
  exName: string;
  maxPoints: string;
  bonus: boolean;
  subexercises: SheetFormExercise[];
}

interface SheetFormState {
  sheetNo: number;
  exercises: SheetFormExercise[];
  bonusSheet: boolean;
}

interface Props extends Omit<FormikBaseFormProps<SheetFormState>, CommonlyUsedFormProps> {
  sheet?: Sheet;
  onSubmit: SheetFormSubmitCallback;
  sheets?: Sheet[];
}

function mapExerciseToSheetFormExercise({
  exName,
  maxPoints,
  bonus,
  subexercises,
}: Exercise): SheetFormExercise {
  return {
    exName,
    maxPoints: maxPoints.toString(),
    bonus,
    subexercises: subexercises.map(mapExerciseToSheetFormExercise),
  };
}

export function getInitialSheetFormState(sheet?: Sheet, sheets?: Sheet[]): SheetFormState {
  if (!!sheet) {
    const exercises: SheetFormExercise[] = sheet.exercises.map(mapExerciseToSheetFormExercise);

    return { sheetNo: sheet.sheetNo, bonusSheet: sheet.bonusSheet, exercises };
  }

  let lastSheetNo = 0;
  if (sheets) {
    lastSheetNo = sheets.length;
  }

  return {
    sheetNo: lastSheetNo + 1,
    exercises: [],
    bonusSheet: false,
  };
}

function SheetForm({ onSubmit, className, sheet, sheets, ...other }: Props): JSX.Element {
  const initialFormState: SheetFormState = getInitialSheetFormState(sheet, sheets);

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormState}
      // validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableDebug
    >
      {() => (
        <>
          <FormikTextField
            name='sheetNo'
            label='Blattnummer'
            type='number'
            inputProps={{ min: 0, step: 1 }}
          />

          <FormikCheckbox name='bonusSheet' label='Bonusblatt' />

          <FormikExerciseEditor name='exercises' />
        </>
      )}
    </FormikBaseForm>
  );
}

export default SheetForm;
