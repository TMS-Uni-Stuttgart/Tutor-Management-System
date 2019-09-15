import { Button, Card, CardActions, CardContent, IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ChevronUp as OpenIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { Exercise, getPointsOfExercise } from 'shared/dist/model/Sheet';
import CustomCardHeader from '../../../../components/CustomCardHeader';
import SubmitButton from '../../../../components/forms/components/SubmitButton';
import ExerciseBox from './ExerciseBox';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      cursor: 'pointer',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
    },
    actions: {
      padding: theme.spacing(1, 2),
      justifyContent: 'flex-end',
    },
    collpaseIcon: {
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      transform: 'rotate(0deg)',
    },
    collapseIconOpen: {
      transform: 'rotate(-180deg)',
    },
    cancelButton: {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.light,
    },
  })
);

interface Props {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  isCollapsed?: boolean;
}

function PointsCard({ avatar, title, subtitle, isCollapsed: isCollapsedProp }: Props): JSX.Element {
  const classes = useStyles();
  const [isCollapsed, setCollapsed] = useState(
    isCollapsedProp !== undefined ? isCollapsedProp : true
  );

  // TODO: Get from props.
  const exercises: Exercise[] = [
    {
      id: '892734012897412384701',
      exName: '1',
      bonus: false,
      maxPoints: 30,
      subexercises: [
        {
          id: '12312378901238012830',
          exName: 'a)',
          bonus: false,
          maxPoints: 15,
          subexercises: [],
        },
        {
          id: '12312378901238012831',
          exName: 'b)',
          bonus: false,
          maxPoints: 15,
          subexercises: [],
        },
        {
          id: '12312378901238012832',
          exName: 'c)',
          bonus: false,
          maxPoints: 15,
          subexercises: [],
        },
        {
          id: '12312378901238012833',
          exName: 'd)',
          bonus: false,
          maxPoints: 15,
          subexercises: [],
        },
      ],
    },
    {
      id: '892734012897412384702',
      exName: '2',
      bonus: false,
      maxPoints: 30,
      subexercises: [],
    },
  ];

  const totalPoints: number = exercises.reduce((pts, ex) => pts + getPointsOfExercise(ex), 0);

  function handleCollapseChange(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setCollapsed(!isCollapsed);
  }

  return (
    <Card>
      <CustomCardHeader
        onClick={handleCollapseChange}
        className={classes.header}
        avatar={avatar}
        title={title}
        subheader={subtitle}
        midText={`Gesamt: ## / ${totalPoints} Punkte`}
        action={
          <IconButton onClick={handleCollapseChange}>
            <OpenIcon
              className={clsx(classes.collpaseIcon, !isCollapsed && classes.collapseIconOpen)}
            />
          </IconButton>
        }
      />

      {!isCollapsed && (
        <>
          <CardContent className={classes.content}>
            {exercises.map(ex => (
              <ExerciseBox key={ex.id} exercise={ex} />
            ))}
          </CardContent>

          <CardActions className={classes.actions}>
            <Button
              variant='outlined'
              className={classes.cancelButton}
              onClick={() => setCollapsed(true)}
            >
              Abbrechen
            </Button>

            <SubmitButton variant='outlined' color='primary' isSubmitting={false}>
              Speichern
            </SubmitButton>
          </CardActions>
        </>
      )}
    </Card>
  );
}

export default PointsCard;
