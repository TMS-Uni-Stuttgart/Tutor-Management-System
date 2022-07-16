import { Button, Card, CardActions, CardContent, CardHeader } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Account as StudentIcon } from 'mdi-material-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import PointsTable from '../../../../components/points-table/PointsTable';
import { Scheinexam } from '../../../../model/Scheinexam';
import { Student } from '../../../../model/Student';

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
  pathTo: string;
}

function StudentCard({ student, exam, pathTo }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Card variant='outlined'>
      <CardHeader
        avatar={<StudentIcon />}
        title={student.name}
        subheader={student.getTeamString()}
      />

      <CardContent>
        <PointsTable grading={student.getGrading(exam)} sheet={exam} />
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
