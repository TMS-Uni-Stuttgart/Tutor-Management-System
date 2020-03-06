import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableContainerBaseProps,
  TableContainerProps,
  TableHead,
  TableProps,
  TableRow,
} from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { convertExercisePointInfoToString } from 'shared/model/Points';
import { HasExercises } from '../../model/Exercise';
import { Grading } from '../../model/Grading';

interface Props extends Omit<TableContainerProps, 'ref'> {
  grading: Grading | undefined;
  sheet: HasExercises;
  disablePaper?: boolean;
  size?: TableProps['size'];
}

function TablePaper({ children, ...props }: TableContainerBaseProps): JSX.Element {
  return (
    <Paper {...props} variant='outlined'>
      {children}
    </Paper>
  );
}

function PointsTable({
  grading,
  sheet,
  size,
  disablePaper,
  className,
  ...props
}: Props): JSX.Element {
  const achieved = grading?.totalPoints ?? 0;

  // TODO: Add operation to sheet / scheinexam to get pointInfo.
  const total = convertExercisePointInfoToString(sheet.pointInfo);

  const TableComp = (
    <Table size={size ?? 'small'} className={clsx(disablePaper && className)}>
      <TableHead>
        <TableRow hover>
          <TableCell>Gesamt:</TableCell>
          <TableCell align='right'>{achieved}</TableCell>
          <TableCell align='left'>/ {total}</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sheet.exercises.map(ex => (
          <TableRow key={ex.id} hover>
            <TableCell>Aufgabe {ex.exName}</TableCell>
            <TableCell align='right'>{grading?.getExerciseGrading(ex)?.totalPoints ?? 0}</TableCell>
            <TableCell align='left'>/ {convertExercisePointInfoToString(ex.pointInfo)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (disablePaper) {
    return <>{TableComp}</>;
  } else {
    return (
      <TableContainer component={TablePaper} {...props} className={className} ref={undefined}>
        {TableComp}
      </TableContainer>
    );
  }
}

export default PointsTable;
