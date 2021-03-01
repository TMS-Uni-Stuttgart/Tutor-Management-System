import { Button, ButtonProps } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 0,
      maxWidth: 32,
      overflow: 'hidden',
      '&:hover': {
        maxWidth: '100%',
        '& $text': {
          opacity: 1,
        },
        '& $icon': {
          marginRight: -4,
        },
      },
      transition: theme.transitions.create('max-width', {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeInOut,
      }),
      transformOrigin: 'right',
    },
    icon: {
      marginRight: -10,
      transition: theme.transitions.create('margin-right', {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeInOut,
      }),
    },
    buttonLabel: {
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    text: {
      opacity: 0,
      transition: theme.transitions.create('opacity', {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeInOut,
      }),
    },
  })
);

interface Props extends Omit<ButtonProps, 'startIcon' | 'children'> {
  icon: React.ReactElement;
  label: string;
}

function AnimatedButton({
  label,
  icon,
  className,
  classes: buttonClasses,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Button
      variant='outlined'
      {...props}
      className={clsx(className, classes.root)}
      endIcon={icon}
      classes={{
        ...buttonClasses,
        endIcon: classes.icon,
        label: classes.buttonLabel,
      }}
    >
      <span className={classes.text}>{label}</span>
    </Button>
  );
}

export default AnimatedButton;
