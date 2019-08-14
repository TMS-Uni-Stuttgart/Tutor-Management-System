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
      fontWeight: theme.typography.fontWeightMedium,
    },
  })
);

interface TutorialStatsCardProps {
  value: TutorialSummaryInfo;
}

function TutorialStatsCard({ value }: TutorialStatsCardProps): JSX.Element {
  const classes = useStyles();

  return (
    <Paper className={classes.statsPaper}>
      {/* <AspectRatio ratio='16-9'> */}
      <Table className={classes.tableRoot}>
        <TableBody>
          <TableRow>
            <TableCell className={classes.tableTitle}>Teilnehmer: </TableCell>
            <TableCell>{Object.values(value.studentInfos).length}</TableCell>
          </TableRow>
          <>
            <TableRow>
              <TableCell className={classes.tableTitle}>Teams: </TableCell>
              <TableCell>{value.tutorial.teams.length}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>Uhrzeit: </TableCell>
              <TableCell>
                {value.tutorial.startTime.toTimeString().substring(0, 5) +
                  ' - ' +
                  value.tutorial.endTime.toTimeString().substring(0, 5)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>Wochentag: </TableCell>
              <TableCell>
                {value.tutorial.dates[0].toLocaleString('de-de', { weekday: 'long' })}
              </TableCell>
            </TableRow>
          </>
        </TableBody>
      </Table>
      {/* </AspectRatio> */}
    </Paper>
  );
}

export default TutorialStatsCard;
