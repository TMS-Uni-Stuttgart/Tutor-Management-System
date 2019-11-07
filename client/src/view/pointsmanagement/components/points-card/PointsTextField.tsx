import { Typography } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import React from 'react';
import { ExercisePointInfo, convertExercisePointInfoToString } from 'shared/dist/model/Points';
import FormikTextField from '../../../../components/forms/components/FormikTextField';

interface PointsTextFieldProps extends Omit<TextFieldProps, 'variant' | 'type'> {
  name: string;
  maxPoints: ExercisePointInfo;
}

function PointsTextField({
  name,
  maxPoints,
  InputProps,
  ...other
}: PointsTextFieldProps): JSX.Element {
  const maxPointsString = convertExercisePointInfoToString(maxPoints);

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
        endAdornment: <Typography variant='body1' noWrap>{`/ ${maxPointsString} Pkt.`}</Typography>,
      }}
    />
  );
}

export default PointsTextField;
