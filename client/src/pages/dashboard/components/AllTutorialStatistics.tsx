import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TableProps } from '@material-ui/core/Table';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableWithoutBorders: {
      '& td': {
        borderBottom: 'none',
      },
    },
    spacingRow: {
      height: theme.spacing(1.5),
    },
    placeholder: {
      marginTop: theme.spacing(8),
      textAlign: 'center',
    },
  })
);

export interface AllTutorialStatisticsProps<T> extends TableProps {
  items: T[];
  createRowFromItem: (item: T) => React.ReactNode;
  placeholder?: string;
}

function AllTutorialStatistics<T>({
  items,
  createRowFromItem,
  placeholder,
}: AllTutorialStatisticsProps<T>): JSX.Element {
  const classes = useStyles();

  return (
    <>
      {items.length === 0 ? (
        <Typography variant='h6' className={classes.placeholder}>
          {placeholder}
        </Typography>
      ) : (
        <>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>{createRowFromItem(item)}</React.Fragment>
          ))}
        </>
      )}
    </>
  );
}

export default AllTutorialStatistics;
