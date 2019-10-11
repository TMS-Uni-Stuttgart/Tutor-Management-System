import React from 'react';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { CircularProgress, Modal, Typography } from '@material-ui/core';
import { CircularProgressProps } from '@material-ui/core/CircularProgress';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spinner: {
      marginRight: theme.spacing(1),
    },
    modal: {
      color: theme.palette.common.white,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      outline: 'none',
    },
    modalText: {
      marginTop: theme.spacing(2),
    },
  })
);

interface Props extends Omit<ButtonProps, 'type'> {
  isSubmitting: boolean;
  CircularProgressProps?: CircularProgressProps;
  modalText?: string;
}

function SubmitButton({
  isSubmitting,
  CircularProgressProps,
  children,
  disabled,
  modalText,
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

      <Modal open={!!modalText && isSubmitting} className={classes.modal}>
        <div className={classes.modalContent} tabIndex={-1}>
          <CircularProgress
            size={56}
            color='inherit'
            className={clsx(
              CircularProgressProps && CircularProgressProps.className,
              classes.spinner
            )}
          />

          <Typography variant='h4' className={classes.modalText}>
            {modalText}
          </Typography>
        </div>
      </Modal>
    </>
  );
}

export default SubmitButton;
