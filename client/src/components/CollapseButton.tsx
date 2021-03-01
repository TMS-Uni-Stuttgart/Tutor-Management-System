import { IconButton } from '@material-ui/core';
import { IconButtonProps } from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ChevronUp as OpenIcon } from 'mdi-material-ui';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    collpaseIcon: {
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      transform: 'rotate(-180deg)',
    },
    collapseIconOpen: {
      transform: 'rotate(0deg)',
    },
  })
);

interface Props extends IconButtonProps {
  isCollapsed: boolean;
}

function CollapseButton({ isCollapsed, ...rest }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <IconButton {...rest}>
      <OpenIcon className={clsx(classes.collpaseIcon, !isCollapsed && classes.collapseIconOpen)} />
    </IconButton>
  );
}

export default CollapseButton;
