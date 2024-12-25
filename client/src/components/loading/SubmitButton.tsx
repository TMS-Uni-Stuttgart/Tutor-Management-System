import { CircularProgress, Tooltip } from '@mui/material';
import Button, { ButtonProps } from '@mui/material/Button';
import { CircularProgressProps } from '@mui/material/CircularProgress';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import LoadingModal from './LoadingModal';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spinner: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Props extends ButtonProps {
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
  startIcon,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();
  const isDisabled = isSubmitting || disabled;

  const ButtomComp = (
    <Button
      type='submit'
      {...other}
      disabled={isDisabled}
      startIcon={!isSubmitting ? startIcon : undefined}
    >
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
