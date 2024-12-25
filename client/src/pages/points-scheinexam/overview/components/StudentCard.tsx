import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Account as StudentIcon } from 'mdi-material-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import PointsTable from '../../../../components/points-table/PointsTable';
import { Scheinexam } from '../../../../model/Scheinexam';
import { Student } from '../../../../model/Student';
import { Grading } from '../../../../model/Grading';

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      justifyContent: 'flex-end',
    },
  })
);

interface Props {
  student: Student;
  exam: Scheinexam;
  grading: Grading | undefined;
  pathTo: string;
}

function StudentCard({ student, exam, grading, pathTo }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Card variant='outlined'>
      <CardHeader
        avatar={<StudentIcon />}
        title={student.name}
        subheader={student.getTeamString()}
      />

      <CardContent>
        <PointsTable grading={grading} sheet={exam} />
      </CardContent>

      <CardActions className={classes.actions}>
        <Button variant='outlined' component={Link} to={pathTo}>
          Punkte eintragen
        </Button>
      </CardActions>
    </Card>
  );
}

export default StudentCard;
