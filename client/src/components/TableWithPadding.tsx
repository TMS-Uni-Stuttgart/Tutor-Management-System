import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Typography, Table, TableBody, TableRow, Box } from '@material-ui/core';
import { TableProps } from '@material-ui/core/Table';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableWithoutBorders: {
      marginBottom: theme.spacing(2),
      '& td': {
        borderBottom: 'none',
      },
    },
    spacingRow: {
      height: theme.spacing(1.5),
    },
    placeholder: {
      marginTop: 64,
      textAlign: 'center',
    },
  })
);

export interface TableWithPaddingProps<T> extends TableProps {
  items: T[];
  createRowFromItem: (item: T) => React.ReactNode;
  placeholder?: string;
}

function TableWithPadding<T>({
  items,
  createRowFromItem,
  placeholder,
  className,
  ...other
}: TableWithPaddingProps<T>): JSX.Element {
  const classes = useStyles();

  return (
    <Box marginTop={2} marginBottom={1}>
      {items.length === 0 ? (
        <Typography variant='h6' className={classes.placeholder}>
          {placeholder}
        </Typography>
      ) : (
        <Table {...other} className={clsx(classes.tableWithoutBorders, className)}>
          <TableBody>
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx !== 0 && <TableRow className={classes.spacingRow} />}

                {createRowFromItem(item)}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

export default TableWithPadding;
