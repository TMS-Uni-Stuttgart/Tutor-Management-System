import { Paper, Table, TableBody, TableCell, TableRow, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { DateTime } from 'luxon';
import { StudentStatus } from 'shared/model/Student';
import { useSettings } from '../../../hooks/useSettings';
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
  const { settings } = useSettings();
  const { studentInfos, tutorial } = value;
  let activeStudents = 0;
  Object.values(studentInfos).forEach(({ student }) => {
    if (student.status === StudentStatus.ACTIVE) {
      activeStudents++;
    }
  });

  return (
    <Paper className={classes.statsPaper}>
      <Table className={classes.tableRoot}>
        <TableBody>
          <TableRow>
            <TableCell className={classes.tableTitle}>Teilnehmer: </TableCell>
            <TableCell>
              {settings.excludeStudentsByStatus
                ? `${activeStudents} aktive, ${Object.values(studentInfos).length} insgesamt`
                : Object.values(studentInfos).length}
            </TableCell>
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
