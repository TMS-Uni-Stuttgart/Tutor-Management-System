import { Button, Card, CardActions, CardContent, IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Formik } from 'formik';
import { ChevronUp as OpenIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { HasId } from 'shared/dist/model/Common';
import { getPointsOfExercise, PointId, PointMap } from 'shared/dist/model/Points';
import { Exercise, HasExercises } from 'shared/dist/model/Sheet';
import CustomCardHeader from '../../../../components/CustomCardHeader';
import SubmitButton from '../../../../components/forms/components/SubmitButton';
import { FormikSubmitCallback } from '../../../../types';
import { HasPoints } from '../../../../typings/types';
import ExerciseBox from './ExerciseBox';
import FormikDebugDisplay from '../../../../components/forms/components/FormikDebugDisplay';
import { CardProps } from '@material-ui/core/Card';

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

type PointCardFormSubExState = { [subExId: string]: string };

export type PointsCardFormState = {
  [exIdentifier: string]: {
    points: string | PointCardFormSubExState;
    comment: string;
  };
};

export type EntityWithPoints = HasId & HasPoints;
export type PointsSaveCallback = FormikSubmitCallback<PointsCardFormState>;

interface Props<T extends EntityWithPoints> extends CardProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  isCollapsed?: boolean;
  entity: T;
  entityWithExercises: HasExercises;
  onPointsSave: PointsSaveCallback;
  onEditPoints?: (entity: T) => void;
}

function getInitialValues(points: PointMap, { id, exercises }: HasExercises): PointsCardFormState {
  const values: PointsCardFormState = {};

  exercises.forEach(ex => {
    const pointId = new PointId(id, ex);
    const entry = points.getPointEntry(pointId);

    if (entry) {
      let points: string | PointCardFormSubExState;

      if (typeof entry.points === 'number') {
        points = entry.points.toString();
      } else {
        const tmpPoints: PointCardFormSubExState = {};

        Object.entries(entry.points).forEach(([key, value]) => {
          tmpPoints[key] = value.toString();
        });

        points = tmpPoints;
      }

      values[pointId.toString()] = { points, comment: entry.comment };
    } else {
      if (ex.subexercises.length > 0) {
        const points: PointCardFormSubExState = {};

        ex.subexercises.forEach(subEx => {
          points[subEx.id] = '0.0';
        });

        values[pointId.toString()] = { points, comment: '' };
      } else {
        values[pointId.toString()] = { points: '0.0', comment: '' };
      }
    }
  });

  return values;
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
  ...other
}: Props<T>): JSX.Element {
  const classes = useStyles();
  const [isCollapsed, setCollapsed] = useState(
    isCollapsedProp !== undefined ? isCollapsedProp : true
  );

  const exercises: Exercise[] = entityWithExercises.exercises;

  const totalPoints: number = exercises.reduce((pts, ex) => pts + getPointsOfExercise(ex), 0);
  const initialValues: PointsCardFormState = getInitialValues(entity.points, entityWithExercises);

  function handleCollapseChange(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setCollapsed(!isCollapsed);
  }

  return (
    <Card {...other}>
      <Formik
        initialValues={initialValues}
        onSubmit={onPointsSave}
        // TODO: Add validation schema?!
      >
        {({ handleSubmit, isValid, isSubmitting, values }) => (
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
                    <ExerciseBox
                      key={ex.id}
                      name={new PointId(entityWithExercises.id, ex).toString()}
                      exercise={ex}
                    />
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

            <FormikDebugDisplay values={values} />
          </>
        )}
      </Formik>
    </Card>
  );
}

export default PointsCard;
