import { IconButton } from '@mui/material';
import { IconButtonProps } from '@mui/material/IconButton';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
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
    <IconButton {...rest} size="large">
      <OpenIcon className={clsx(classes.collpaseIcon, !isCollapsed && classes.collapseIconOpen)} />
    </IconButton>
  );
}

export default CollapseButton;
