import { Fab, Grow, Paper, Typography } from '@material-ui/core';
import { GrowProps } from '@material-ui/core/Grow';
import { PaperProps } from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Plus as AddIcon } from 'mdi-material-ui';
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
      marginLeft: theme.spacing(2),
    },
    actionButtonFloat: {
      zIndex: 1,
      marginLeft: 'unset',
      position: 'absolute',
      top: theme.spacing(1),
      right: theme.spacing(2),
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

export interface EditorOpenState {
  isEditorOpen: boolean;
  isAnimating: boolean;
}

interface Props extends PaperProps {
  title: string;
  children: React.ReactNode;
  GrowProps?: GrowProps;
  onOpenChange?: (openState: EditorOpenState) => void;
}

function OpenableFormWithFab({
  className,
  GrowProps,
  title,
  onOpenChange,
  children,
  ...other
}: Props): JSX.Element {
  const [openState, setOpenState] = useState<EditorOpenState>({
    isEditorOpen: false,
    isAnimating: false,
  });
  const classes = useStyles();

  function handleAddIconClicked(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    setIsEditorOpen(!openState.isEditorOpen);
  }

  function setEditorState(newState: EditorOpenState) {
    setOpenState(newState);

    if (onOpenChange) {
      onOpenChange(newState);
    }
  }

  function setIsEditorOpen(isEditorOpen: boolean) {
    const newState: EditorOpenState = {
      isEditorOpen,
      isAnimating: true,
    };

    setEditorState(newState);
  }

  function setAnimating(isAnimating: boolean) {
    const newState: EditorOpenState = {
      ...openState,
      isAnimating,
    };

    setEditorState(newState);
  }

  return (
    <>
      <Fab
        className={clsx(
          classes.actionButton,
          openState.isEditorOpen ? classes.actionButtonCancel : classes.actionButtonNew,
          (openState.isEditorOpen || openState.isAnimating) && classes.actionButtonFloat
        )}
        onClick={handleAddIconClicked}
        variant='extended'
      >
        <AddIcon
          className={clsx(classes.addIcon, openState.isEditorOpen && classes.addIconIsOpen)}
        />
        {openState.isEditorOpen ? 'Abbrechen' : 'Neu'}
      </Fab>

      <Grow
        in={openState.isEditorOpen}
        unmountOnExit
        style={{ transformOrigin: 'top right' }}
        onEntered={() => setAnimating(false)}
        onExited={() => setAnimating(false)}
        {...GrowProps}
      >
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
