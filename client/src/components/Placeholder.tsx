import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import LoadingSpinner from './loading/LoadingSpinner';
import clsx from 'clsx';

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
}

function Placeholder({
  children,
  placeholderText,
  showPlaceholder,
  loading,
  reduceMarginTop,
}: Props): JSX.Element {
  const classes = useStyles();

  if (loading) {
    return <LoadingSpinner />;
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
