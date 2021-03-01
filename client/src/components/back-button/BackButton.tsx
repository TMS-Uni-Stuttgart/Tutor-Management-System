import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ChevronLeft as BackIcon } from 'mdi-material-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { useDisableBackButton } from './DisableBackButton.context';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backIcon: {
      marginLeft: theme.spacing(-0.5),
      marginRight: theme.spacing(0.5),
    },
    backButton: {
      width: 'max-content',
    },
  })
);

interface Props {
  to: string;
  className?: string;
}

function BackButton({ to, className }: Props): JSX.Element | null {
  const classes = useStyles();
  const { isBackDisabled } = useDisableBackButton();

  if (isBackDisabled) {
    return null;
  }

  return (
    <Button
      variant='outlined'
      className={clsx(className, classes.backButton)}
      component={Link}
      to={to}
    >
      <BackIcon className={classes.backIcon} />
      Zurück
    </Button>
  );
}

export default BackButton;
