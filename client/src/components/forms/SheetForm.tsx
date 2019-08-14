import React from 'react';
import { FormikSubmitCallback } from '../../types';
import { Sheet } from '../../typings/RatingModel';
import FormikCheckbox from './components/FormikCheckbox';
import FormikExerciseEditor from './components/FormikExerciseEditor';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

export type SheetFormSubmitCallback = FormikSubmitCallback<SheetFormState>;

type SheetFormState = Omit<Sheet, 'id'>;

interface Props extends Omit<FormikBaseFormProps<SheetFormState>, CommonlyUsedFormProps> {
  sheet?: Sheet;
  onSubmit: SheetFormSubmitCallback;
  sheets?: Sheet[];
}

export function getInitialSheetFormState(sheet?: Sheet, sheets?: Sheet[]): SheetFormState {
  if (!!sheet) {
    return { ...sheet };
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
