import React from 'react';
import { Sheet } from 'shared/dist/model/Sheet';
import { FormikSubmitCallback } from '../../types';
import FormikCheckbox from './components/FormikCheckbox';
import FormikExerciseEditor from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

export type SheetFormSubmitCallback = FormikSubmitCallback<SheetFormState>;

export interface SheetFormExercise {
  exNo: string;
  maxPoints: string;
  bonus: boolean;
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

export function getInitialSheetFormState(sheet?: Sheet, sheets?: Sheet[]): SheetFormState {
  if (!!sheet) {
    const exercises = sheet.exercises.map(ex => ({
      exNo: ex.exNo.toString(),
      maxPoints: ex.maxPoints.toString(),
      bonus: ex.bonus,
    }));

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
