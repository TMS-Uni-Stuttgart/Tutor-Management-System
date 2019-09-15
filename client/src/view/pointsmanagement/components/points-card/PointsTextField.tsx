import { TextField, Typography } from '@material-ui/core';
import { OutlinedTextFieldProps } from '@material-ui/core/TextField';
import React from 'react';

interface PointsTextFieldProps extends Omit<OutlinedTextFieldProps, 'variant' | 'type'> {
  points: string;
}

function PointsTextField({ points, InputProps, ...other }: PointsTextFieldProps): JSX.Element {
  return (
    <TextField
      {...other}
      variant='outlined'
      type='number'
      // inputProps={{
      //   tabIndex: tabIndexForRow,
      //   min: 0,
      //   step: 0.1,
      //   max: ex.maxPoints,
      // }}
      InputProps={{
        ...InputProps,
        endAdornment: <Typography variant='body2' noWrap>{`/ ${points} Pkt.`}</Typography>,
      }}
    />
  );
}

export default PointsTextField;
