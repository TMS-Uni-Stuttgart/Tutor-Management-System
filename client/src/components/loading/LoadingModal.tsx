import {
  CircularProgress,
  CircularProgressProps,
  Modal,
  ModalProps,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme) =>
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

interface Props extends Omit<ModalProps, 'children'> {
  modalText: string;
  open: boolean;
  CircularProgressProps?: CircularProgressProps;
}

function LoadingModal({
  modalText,
  CircularProgressProps,
  className,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Modal {...props} className={clsx(className, classes.modal)}>
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
  );
}

export default LoadingModal;
