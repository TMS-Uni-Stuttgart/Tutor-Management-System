import { CircularProgress, Tooltip } from '@material-ui/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { CircularProgressProps } from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import LoadingModal from './LoadingModal';

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
  tooltipText?: string;
}

function SubmitButton({
  isSubmitting,
  CircularProgressProps,
  children,
  disabled,
  modalText,
  tooltipText,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();
  const isDisabled = isSubmitting || disabled;

  const ButtomComp = (
    <Button {...other} type='submit' disabled={isDisabled}>
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
  );
  return (
    <>
      {tooltipText && !isDisabled ? (
        <Tooltip title={tooltipText}>{ButtomComp}</Tooltip>
      ) : (
        ButtomComp
      )}

      {modalText && (
        <LoadingModal
          modalText={modalText}
          open={isSubmitting}
          CircularProgressProps={CircularProgressProps}
        />
      )}
    </>
  );
}

export default SubmitButton;
