import { LinearProgress, withStyles } from '@material-ui/core';
import GREEN from '@material-ui/core/colors/green';
import RED from '@material-ui/core/colors/red';
import { LinearProgressProps } from '@material-ui/core/LinearProgress';
import { lighten } from '@material-ui/core/styles';
import React from 'react';

interface StatusProgressState {
  achieved: number;
  total: number;
  passed: boolean;
}

interface Props extends Omit<LinearProgressProps, 'value' | 'variant' | 'color'> {
  status?: StatusProgressState;
}

const BorderLinearProgress = withStyles({
  root: {
    height: 10,
    borderRadius: 4,
  },
  bar: {
    borderRadius: 4,
  },
  colorPrimary: {
    backgroundColor: lighten(GREEN[600], 0.5),
  },
  barColorPrimary: {
    backgroundColor: GREEN[600],
  },
  colorSecondary: {
    backgroundColor: lighten(RED[600], 0.5),
  },
  barColorSecondary: {
    backgroundColor: RED[600],
  },
})(LinearProgress);

function StatusProgress({ status, ...other }: Props): JSX.Element {
  if (!status) {
    return <BorderLinearProgress {...other} variant={'indeterminate'} color={'secondary'} />;
  }

  const achieved = status.achieved < status.total ? status.achieved : status.total;

  return (
    <BorderLinearProgress
      {...other}
      variant={'determinate'}
      color={status.passed ? 'primary' : 'secondary'}
      value={(achieved / status.total) * 100}
    />
  );
}

export default StatusProgress;
