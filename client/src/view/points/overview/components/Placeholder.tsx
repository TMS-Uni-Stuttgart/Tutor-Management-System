import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    placeholder: {
      marginTop: theme.spacing(8),
      textAlign: 'center',
    },
  })
);

interface Props {
  placeholderText: string;
  showPlaceholder: boolean;
  children: React.ReactNode;
}

function Placeholder({ children, placeholderText, showPlaceholder }: Props): JSX.Element {
  const classes = useStyles();

  if (showPlaceholder) {
    return (
      <Typography className={classes.placeholder} variant='h6'>
        {placeholderText}
      </Typography>
    );
  }

  return <>{children}</>;
}

export default Placeholder;
