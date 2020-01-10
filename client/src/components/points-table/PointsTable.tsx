import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableContainerBaseProps,
  TableHead,
  TableRow,
} from '@material-ui/core';
import React from 'react';
import {
  convertExercisePointInfoToString,
  getPointsOfAllExercises,
  getPointsOfExercise,
  PointId,
  PointMap,
} from 'shared/dist/model/Points';
import { Exercise, HasExercises } from 'shared/dist/model/Sheet';

interface Props extends React.ComponentProps<'div'> {
  points: PointMap;
  sheet: HasExercises;
}

function TablePaper({ children, ...props }: TableContainerBaseProps): JSX.Element {
  return (
    <Paper {...props} variant='outlined'>
      {children}
    </Paper>
  );
}

function getPointStringOfExercise(exercise: Exercise): string {
  const pointInfo = getPointsOfExercise(exercise);

  return convertExercisePointInfoToString(pointInfo);
}

function PointsTable({ points, sheet, ...props }: Props): JSX.Element {
  const achieved = points.getSumOfPoints(sheet);
  const total = convertExercisePointInfoToString(getPointsOfAllExercises(sheet));

  return (
    <TableContainer component={TablePaper} {...props} ref={undefined}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Gesamt:</TableCell>
            <TableCell align='right'>{achieved}</TableCell>
            <TableCell align='left'>/ {total}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sheet.exercises.map(ex => (
            <TableRow key={ex.id}>
              <TableCell>Aufgabe {ex.exName}</TableCell>
              <TableCell align='right'>
                {points.getPoints(new PointId(sheet.id, ex)) ?? 0}
              </TableCell>
              <TableCell align='left'>/ {getPointStringOfExercise(ex)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PointsTable;
