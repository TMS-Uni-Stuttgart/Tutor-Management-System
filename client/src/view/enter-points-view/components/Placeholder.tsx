import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

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

  return (
    <>
      {showPlaceholder ? (
        <Typography className={classes.placeholder} variant='h6'>
          {placeholderText}
        </Typography>
      ) : (
        children
      )}
    </>
  );
}

export default Placeholder;
