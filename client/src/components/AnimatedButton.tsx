import { Button, ButtonProps, Fade } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 32,
      '&:hover': {
        maxWidth: '100%',
      },
      transition: theme.transitions.create('max-width', {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeInOut,
      }),
    },
    unhoveredIcon: {
      marginLeft: -10,
      marginRight: 0,
    },
    buttonLabel: {
      alignItems: 'unset',
    },
    unhoveredLabel: {
      justifyContent: 'unset',
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
  const [isHovered, setHovered] = useState(false);

  return (
    <Button
      variant='outlined'
      {...props}
      className={clsx(className, classes.root)}
      endIcon={icon}
      classes={{
        ...buttonClasses,
        endIcon: !isHovered ? classes.unhoveredIcon : undefined,
        label: clsx(classes.buttonLabel, !isHovered && classes.unhoveredLabel),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Fade in={isHovered} timeout={{ enter: 0, exit: 100 }} unmountOnExit >
        <span>{label}</span>
      </Fade>
    </Button>
  );
}

export default AnimatedButton;
