import React from 'react';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { CircularProgress } from '@material-ui/core';
import { CircularProgressProps } from '@material-ui/core/CircularProgress';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spinner: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Props extends Omit<ButtonProps, 'type'> {
  isSubmitting: boolean;
  CircularProgressProps?: CircularProgressProps;
}

function SubmitButton({
  isSubmitting,
  CircularProgressProps,
  children,
  disabled,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();
  return (
    <>
      <Button {...other} type='submit' disabled={isSubmitting || disabled}>
        {isSubmitting && (
          <CircularProgress
            size={24}
            {...CircularProgressProps}
            className={clsx(
              CircularProgressProps && CircularProgressProps.className,
              classes.spinner
            )}
          />
        )}

        {children}
      </Button>
    </>
  );
}

export default SubmitButton;
