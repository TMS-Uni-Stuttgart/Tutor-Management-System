import { Button, Card, CardActions, CardContent, CardHeader } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Account as StudentIcon } from 'mdi-material-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { Student } from 'shared/dist/model/Student';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import PointsTable from '../../../../components/points-table/PointsTable';
import { getEnterPointsForScheinexamPath } from '../../../../routes/Routing.helpers';
import { PointMap } from 'shared/dist/model/Points';

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
  exam: ScheinExam;
}

function getTeamDisplayString(student: Student): string {
  return !!student.team ? `Team ${student.team.teamNo.toString().padStart(2, '0')}` : 'Ohne Team';
}

function StudentCard({ student, exam, tutorialId }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Card variant='outlined'>
      <CardHeader
        avatar={<StudentIcon />}
        title={getNameOfEntity(student)}
        subheader={getTeamDisplayString(student)}
      />

      <CardContent>
        <PointsTable points={new PointMap(student.scheinExamResults)} sheet={exam} />
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
