import { Typography } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import React from 'react';
import { ExercisePointInfo, convertExercisePointInfoToString } from 'shared/model/Points';
import FormikTextField from './forms/components/FormikTextField';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      width: 'unset',
      flex: 1,
      textAlign: 'right',
    },
  })
);

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
  const classes = useStyles();

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
        className: classes.input,
      }}
      InputProps={{
        ...InputProps,
        endAdornment: <Typography variant='body1' noWrap>{`/ ${maxPointsString}`}</Typography>,
      }}
    />
  );
}

export default PointsTextField;
