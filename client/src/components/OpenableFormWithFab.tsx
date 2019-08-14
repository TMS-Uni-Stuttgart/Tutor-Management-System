import { Fab, Grow, Paper, Typography } from '@material-ui/core';
import { GrowProps } from '@material-ui/core/Grow';
import { PaperProps } from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Add as AddIcon } from '@material-ui/icons';
import clsx from 'clsx';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formContainer: {
      width: 'inherit',
      marginTop: theme.spacing(2.5),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    paper: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: theme.spacing(1.75, 2, 1.75, 2),
    },
    paperTopRow: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    actionButton: {
      zIndex: 1,
      marginLeft: 'unset',
      position: 'absolute',
      top: theme.spacing(3),
      right: theme.spacing(3),
    },
    actionButtonNew: {
      background: theme.palette.green.main,
      '&:hover': {
        background: theme.palette.green.dark,
      },
    },
    actionButtonCancel: {
      background: theme.palette.red.main,
      '&:hover': {
        background: theme.palette.red.dark,
      },
    },
    addIcon: {
      marginRight: theme.spacing(0.5),
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      transform: 'rotate(0deg)',
    },
    addIconIsOpen: {
      transform: 'rotate(45deg)',
    },
  })
);

interface Props extends PaperProps {
  title: string;
  children: React.ReactNode;
  GrowProps?: GrowProps;
}

function OpenableFormWithFab({ className, GrowProps, title, children, ...other }: Props) {
  const [showEditBox, setShowEditBox] = useState(false);
  const classes = useStyles();

  function handleAddIconClicked(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    setShowEditBox(!showEditBox);
  }

  return (
    <>
      <Fab
        className={clsx(
          classes.actionButton,
          showEditBox ? classes.actionButtonCancel : classes.actionButtonNew
        )}
        onClick={handleAddIconClicked}
        variant='extended'
      >
        <AddIcon className={clsx(classes.addIcon, showEditBox && classes.addIconIsOpen)} />
        {showEditBox ? 'Abbrechen' : 'Neu'}
      </Fab>

      <Grow in={showEditBox} unmountOnExit style={{ transformOrigin: 'top right' }} {...GrowProps}>
        <Paper {...other} className={clsx(className, classes.paper)}>
          <div className={classes.paperTopRow}>
            <Typography variant='h6'>{title}</Typography>
          </div>

          <div className={classes.formContainer}>{children}</div>
        </Paper>
      </Grow>
    </>
  );
}

export default OpenableFormWithFab;
