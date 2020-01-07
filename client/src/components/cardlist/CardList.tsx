import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '100%',
      },
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: 'repeat(auto-fit, calc(100% / 2))',
      },
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: 'repeat(auto-fit, calc(100% / 3))',
      },
      [theme.breakpoints.up('xl')]: {
        gridTemplateColumns: 'repeat(auto-fit, calc(100% / 4))',
      },
      marginBottom: theme.spacing(2),
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  })
);

interface Props {
  children: React.ReactNode;
  className?: string;
}

function CardList({ children, className }: Props): JSX.Element {
  const classes = useStyles();

  return <div className={clsx(classes.root, className)}>{children}</div>;
}

export default CardList;
