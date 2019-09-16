import { Button, Card, CardActions, CardContent, IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ChevronUp as OpenIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { Exercise, getPointsOfExercise, HasExercises } from 'shared/dist/model/Sheet';
import CustomCardHeader from '../../../../components/CustomCardHeader';
import SubmitButton from '../../../../components/forms/components/SubmitButton';
import ExerciseBox from './ExerciseBox';
import { FormikSubmitCallback } from '../../../../types';
import { HasId } from 'shared/dist/model/Common';
import { HasPoints } from '../../../../typings/types';
import { Formik } from 'formik';

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

export type PointsCardFormState = {
  [exIdentifier: string]: {
    points:
      | string
      | {
          [subExId: string]: string;
        };
    comment: string;
  };
};

export type EntityWithPoints = HasId & HasPoints;
export type PointsSaveCallback = FormikSubmitCallback<PointsCardFormState>;

interface Props<T extends EntityWithPoints> {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  isCollapsed?: boolean;
  entity: T;
  entityWithExercises: HasExercises;
  onPointsSave: PointsSaveCallback;
  onEditPoints?: (entity: T) => void;
}

function PointsCard<T extends EntityWithPoints>({
  avatar,
  title,
  subtitle,
  isCollapsed: isCollapsedProp,
  entity,
  entityWithExercises,
  onPointsSave,
  onEditPoints,
}: Props<T>): JSX.Element {
  const classes = useStyles();
  const [isCollapsed, setCollapsed] = useState(
    isCollapsedProp !== undefined ? isCollapsedProp : true
  );

  const exercises: Exercise[] = entityWithExercises.exercises;

  const totalPoints: number = exercises.reduce((pts, ex) => pts + getPointsOfExercise(ex), 0);
  // TODO: Generate these from the given entity!
  const initialValues: PointsCardFormState = {};

  function handleCollapseChange(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setCollapsed(!isCollapsed);
  }

  return (
    <Card>
      <Formik
        initialValues={initialValues}
        onSubmit={onPointsSave}
        // TODO: Add validation schema?!
      >
        {({ handleSubmit, isValid, isSubmitting }) => (
          <>
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
              <form onSubmit={handleSubmit}>
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

                  <SubmitButton
                    variant='outlined'
                    color='primary'
                    disabled={!isValid || isSubmitting}
                    isSubmitting={isSubmitting}
                  >
                    Speichern
                  </SubmitButton>
                </CardActions>
              </form>
            )}
          </>
        )}
      </Formik>
    </Card>
  );
}

export default PointsCard;
