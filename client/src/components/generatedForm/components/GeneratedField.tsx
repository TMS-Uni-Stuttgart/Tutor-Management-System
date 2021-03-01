import { Typography } from '@material-ui/core';
import { FormikValues } from 'formik';
import React from 'react';
import { useTranslation } from '../../../util/lang/configI18N';
import { useLogger } from '../../../util/Logger';
import FormikCheckbox from '../../forms/components/FormikCheckbox';
import FormikSelect from '../../forms/components/FormikSelect';
import FormikTextField from '../../forms/components/FormikTextField';
import { FormFieldData } from '../types/FieldData';
import { FormFieldType } from '../types/FormFieldType';

interface FieldProps {
  fieldData: FormFieldData;
  name: string;
  values: FormikValues;
}

function GeneratedField({ fieldData, name, values }: FieldProps): JSX.Element {
  const { STRING, INTEGER, FLOAT, SELECT, BOOLEAN, ENUM } = FormFieldType;
  const logger = useLogger('GeneratedField');
  const { t } = useTranslation('scheincriteria');
  const label = t(`FIELD_LABEL_${name}`);

  switch (fieldData.type) {
    case STRING:
      return <FormikTextField name={name} label={label} type='text' />;

    case BOOLEAN:
      return <FormikCheckbox name={name} label={label} />;

    case INTEGER:
      return (
        <FormikTextField
          name={name}
          label={label}
          type='number'
          inputProps={{ min: fieldData.min, max: fieldData.max }}
        />
      );

    case FLOAT:
      const { min, max, percentageToggleField, percentage } = fieldData;
      const isPercentage: boolean =
        percentage || (!!percentageToggleField && !!values[percentageToggleField]);

      return (
        <FormikTextField
          name={name}
          label={label}
          type='number'
          isPercentage={isPercentage}
          inputProps={{
            min,
            max: isPercentage ? 100 : max,
            step: 0.1,
          }}
        />
      );

    case SELECT:
      return (
        <FormikSelect
          name={name}
          label={label}
          emptyPlaceholder={t(`FIELD_EMPTY_PLACHOLDER_${name}`)}
          items={fieldData.values}
          itemToString={(val) => {
            if (typeof val.value === 'object' && !val.displayValue) {
              logger.error(
                `If the value of this item is an object you must provide the "displayValue" property to display this item in the dropdown menu.\n\nProvided object:\n${val.value}`
              );
              return null;
            }

            return val.displayValue ? val.displayValue : val.value;
          }}
          itemToValue={(val) => val.identifier}
        />
      );

    case ENUM:
      return (
        <FormikSelect
          name={name}
          label={label}
          emptyPlaceholder={t(`FIELD_EMPTY_PLACHOLDER_${name}`)}
          items={fieldData.enumValues}
          itemToString={(val) => {
            if (typeof val.value === 'object' && !val.displayValue) {
              logger.error(
                `If the value of this item is an object you must provide the "displayValue" property to display this item in the dropdown menu.\n\nProvided object:\n${val.value}`
              );
              return null;
            }

            return val.displayValue ? val.displayValue : val.value;
          }}
          itemToValue={(val) => val.identifier}
        />
      );

    default:
      return (
        <Typography color='error'>
          Feld konnt nicht generiert werden, da der Typ nicht unterstützt wird.
        </Typography>
      );
  }
}

export default GeneratedField;
