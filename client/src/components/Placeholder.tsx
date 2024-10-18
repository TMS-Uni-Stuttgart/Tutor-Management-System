import { Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import LoadingSpinner, { LoadingSpinnerProps } from './loading/LoadingSpinner';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    placeholder: {
      marginTop: theme.spacing(8),
      textAlign: 'center',
    },
    reducedMargin: {
      marginTop: theme.spacing(2),
    },
  })
);

interface Props {
  placeholderText: string;
  showPlaceholder: boolean;
  children: React.ReactNode;
  loading?: boolean;
  reduceMarginTop?: boolean;
  SpinnerProps?: LoadingSpinnerProps;
}

function Placeholder({
  children,
  placeholderText,
  showPlaceholder,
  loading,
  reduceMarginTop,
  SpinnerProps,
}: Props): JSX.Element {
  const classes = useStyles();

  if (loading) {
    return <LoadingSpinner {...SpinnerProps} />;
  }

  if (showPlaceholder) {
    return (
      <Typography
        className={clsx(classes.placeholder, reduceMarginTop && classes.reducedMargin)}
        variant='h6'
      >
        {placeholderText}
      </Typography>
    );
  }

  return <>{children}</>;
}

export default Placeholder;
