import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { TutorialInEntity } from 'shared/model/Common';
import * as Yup from 'yup';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';
import { useFetchState } from '../../hooks/useFetchState';
import { FormikSubmitCallback } from '../../types';
import LoadingSpinner from '../loading/LoadingSpinner';
import FormikSelect from './components/FormikSelect';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

const useStyles = makeStyles(
  createStyles({
    spanAllColumns: {
      gridColumn: '1 / -1',
    },
  })
);

export interface TutorialChangeFormState {
  tutorial: string;
}

const validationSchema = Yup.object().shape({
  tutorial: Yup.string().required('Benötigt'),
});

export type TutorialChangeFormSubmitCallback = FormikSubmitCallback<TutorialChangeFormState>;

interface Props extends Omit<FormikBaseFormProps<TutorialChangeFormState>, CommonlyUsedFormProps> {
  tutorial: TutorialInEntity;
  onSubmit: TutorialChangeFormSubmitCallback;
  onCancel: () => void;
}

function TutorialChangeForm({
  tutorial,
  onSubmit,
  className,
  onCancel,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();

  const { value: allTutorials, isLoading } = useFetchState({
    fetchFunction: getAllTutorials,
    immediate: true,
    params: [],
  });

  const initialFormValues: TutorialChangeFormState = {
    tutorial: tutorial.id,
  };

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      onCancelClicked={onCancel}
    >
      {() =>
        isLoading ? (
          <LoadingSpinner text='Lade Tutorien' className={classes.spanAllColumns} />
        ) : (
          <FormikSelect
            name='tutorial'
            label='Tutorium'
            emptyPlaceholder='Keine Tutorien vorhanden.'
            items={allTutorials ?? []}
            itemToString={(t) => t.toDisplayString()}
            itemToValue={(t) => t.id}
            fullWidth
            className={classes.spanAllColumns}
          />
        )
      }
    </FormikBaseForm>
  );
}

export default TutorialChangeForm;
