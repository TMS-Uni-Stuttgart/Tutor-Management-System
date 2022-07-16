import {
  createStyles,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Theme,
} from '@material-ui/core';
import { DateTime } from 'luxon';
import React from 'react';
import { TutorialSummaryInfo } from '../Dashboard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    statsPaper: {
      margin: theme.spacing(1),
      padding: theme.spacing(2),
      overflowX: 'auto',
    },
    tableRoot: {
      '& td': {
        padding: theme.spacing(2),
      },
      '& tr:last-child td': {
        borderBottom: 'none',
      },
    },
    tableTitle: {
      fontWeight: 'bolder',
    },
  })
);

interface TutorialStatsCardProps {
  value: TutorialSummaryInfo;
}

function TutorialStatsCard({ value }: TutorialStatsCardProps): JSX.Element {
  const classes = useStyles();
  const { studentInfos, tutorial } = value;

  return (
    <Paper className={classes.statsPaper}>
      <Table className={classes.tableRoot}>
        <TableBody>
          <TableRow>
            <TableCell className={classes.tableTitle}>Teilnehmer: </TableCell>
            <TableCell>{Object.values(studentInfos).length}</TableCell>
          </TableRow>
          <>
            <TableRow>
              <TableCell className={classes.tableTitle}>Teams: </TableCell>
              <TableCell>{tutorial.teams.length}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>Uhrzeit: </TableCell>
              <TableCell>
                {tutorial.startTime.toLocaleString(DateTime.TIME_24_SIMPLE) +
                  ' - ' +
                  tutorial.endTime.toLocaleString(DateTime.TIME_24_SIMPLE)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>Wochentag: </TableCell>
              <TableCell>{tutorial.dates[0].toFormat('EEEE')}</TableCell>
            </TableRow>
          </>
        </TableBody>
      </Table>
    </Paper>
  );
}

export default TutorialStatsCard;
