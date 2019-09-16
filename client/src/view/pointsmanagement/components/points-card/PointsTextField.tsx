import { Typography } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import React from 'react';
import FormikTextField from '../../../../components/forms/components/FormikTextField';

interface PointsTextFieldProps extends Omit<TextFieldProps, 'variant' | 'type'> {
  name: string;
  maxPoints: number;
}

function PointsTextField({
  name,
  maxPoints,
  InputProps,
  ...other
}: PointsTextFieldProps): JSX.Element {
  return (
    <FormikTextField
      {...other}
      name={name}
      type='number'
      inputProps={{
        // tabIndex: tabIndexForRow,
        min: 0,
        step: 0.1,
        max: maxPoints,
      }}
      InputProps={{
        ...InputProps,
        endAdornment: <Typography variant='body2' noWrap>{`/ ${maxPoints} Pkt.`}</Typography>,
      }}
    />
  );
}

export default PointsTextField;
