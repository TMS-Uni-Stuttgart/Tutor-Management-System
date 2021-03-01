import { useField } from 'formik';
import React, { useCallback } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import { Tutorial } from '../../../model/Tutorial';
import FormikSelect, { FormikSelectProps } from './FormikSelect';

interface Props
  extends Omit<
    FormikSelectProps<Tutorial>,
    'itemToString' | 'itemToValue' | 'isItemSelected' | 'multiple'
  > {
  disableMultiple?: boolean;
}

function FormikTutorialSelect({
  name,
  emptyPlaceholder,
  disableMultiple,
  ...props
}: Props): JSX.Element {
  const [, { value }] = useField(name);
  const isNotMultiple = disableMultiple ?? false;

  const isItemSelected = useCallback(
    (tutorial) => {
      if (!Array.isArray(value)) {
        return false;
      }

      return value.indexOf(tutorial.id) > -1;
    },
    [value]
  );

  return (
    <FormikSelect
      name={name}
      itemToString={(tutorial) => ({
        primary: tutorial.toDisplayStringWithTime(),
        secondary: tutorial.tutor ? `Tutor/in: ${getNameOfEntity(tutorial.tutor)}` : undefined,
      })}
      itemToValue={(tutorial) => tutorial.id}
      {...props}
      emptyPlaceholder={emptyPlaceholder ?? 'Keine Tutorien vorhanden.'}
      multiple={!isNotMultiple}
      isItemSelected={isNotMultiple ? undefined : isItemSelected}
    />
  );
}

export default FormikTutorialSelect;
