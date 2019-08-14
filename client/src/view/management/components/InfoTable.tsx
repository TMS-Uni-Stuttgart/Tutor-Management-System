import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography, Table, TableBody, TableRow } from '@material-ui/core';
import { TableProps } from '@material-ui/core/Table';
import clsx from 'clsx';

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
      marginTop: theme.spacing(2),
      textAlign: 'center',
    },
  })
);

export interface InfoTableProps<T> extends TableProps {
  items: T[];
  createRowFromItem: (item: T) => React.ReactNode;
  placeholder?: string;
}

function InfoTable<T>({
  items,
  createRowFromItem,
  placeholder,
  className,
  ...other
}: InfoTableProps<T>): JSX.Element {
  const classes = useStyles();

  return (
    <>
      {items.length === 0 ? (
        <Typography variant='h6' className={classes.placeholder}>
          {placeholder}
        </Typography>
      ) : (
        <Table {...other} className={clsx(classes.tableWithoutBorders, className)}>
          <TableBody>
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                <TableRow className={classes.spacingRow} />

                {createRowFromItem(item)}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

export default InfoTable;
