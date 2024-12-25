import React from 'react';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Box, BoxProps, Table, TableBody, TableRow, Typography } from '@mui/material';
import { TableProps } from '@mui/material/Table';
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
  createRowFromItem: (item: T, idx: number) => React.ReactNode;
  placeholder?: string;
  BoxProps?: BoxProps;
}

function TableWithPadding<T>({
  items,
  createRowFromItem,
  placeholder,
  className,
  BoxProps,
  ...other
}: TableWithPaddingProps<T>): JSX.Element {
  const classes = useStyles();

  return (
    <Box {...BoxProps}>
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

                {createRowFromItem(item, idx)}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

export default TableWithPadding;
