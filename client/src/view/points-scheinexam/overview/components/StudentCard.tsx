import { Button, Card, CardActions, CardContent, CardHeader } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Account as StudentIcon } from 'mdi-material-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { getNameOfEntity } from 'shared/util/helpers';
import PointsTable from '../../../../components/points-table/PointsTable';
import { Scheinexam } from '../../../../model/Scheinexam';
import { Student } from '../../../../model/Student';
import { getEnterPointsForScheinexamPath } from '../../../../routes/Routing.helpers';

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      justifyContent: 'flex-end',
    },
  })
);

interface Props {
  tutorialId: string;
  student: Student;
  exam: Scheinexam;
}

function StudentCard({ student, exam, tutorialId }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Card variant='outlined'>
      <CardHeader
        avatar={<StudentIcon />}
        title={getNameOfEntity(student)}
        subheader={student.getTeamString()}
      />

      <CardContent>
        <PointsTable grading={student.getGrading(exam)} sheet={exam} />
      </CardContent>

      <CardActions className={classes.actions}>
        <Button
          variant='outlined'
          component={Link}
          to={getEnterPointsForScheinexamPath({
            tutorialId,
            examId: exam.id,
            studentId: student.id,
          })}
        >
          Punkte eintragen
        </Button>
      </CardActions>
    </Card>
  );
}

export default StudentCard;
