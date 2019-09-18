import { Button, Card, CardActions, CardContent, IconButton } from '@material-ui/core';
import { CardProps } from '@material-ui/core/Card';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Formik, FormikConsumer } from 'formik';
import { ChevronUp as OpenIcon, TableEdit as EditPointsIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { HasId } from 'shared/dist/model/Common';
import {
  getPointsOfExercise,
  PointId,
  PointMap,
  PointMapEntry,
  PointsOfSubexercises,
  UpdatePointsDTO,
} from 'shared/dist/model/Points';
import { Exercise, HasExercises } from 'shared/dist/model/Sheet';
import CustomCardHeader from '../../../../components/CustomCardHeader';
import SubmitButton from '../../../../components/forms/components/SubmitButton';
import { FormikSubmitCallback } from '../../../../types';
import { HasPoints } from '../../../../typings/types';
import ExerciseBox from './ExerciseBox';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexShrink: 0,
    },
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

type PointsCardFormSubExState = { [subExId: string]: string };

export type PointsCardFormExerciseState = {
  points: string | PointsCardFormSubExState;
  comment: string;
};

export type PointsCardFormState = {
  [exIdentifier: string]: PointsCardFormExerciseState;
};

export type EntityWithPoints = HasId & HasPoints;
export type PointsSaveCallback = FormikSubmitCallback<PointsCardFormState>;

interface Props<T extends EntityWithPoints> extends CardProps {
  /**
   * By specifing a `name` this component can be used inside another Formik context.
   *
   * If a `name` is specified:
   * - This will be handled as a prefix to all Formik-compatible sub-components (followed by a '.').
   * - The Formik context inside the PointsCard will __NOT__ be provided. Instead there has to be such a context from outside.
   */
  name?: string;

  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  isCollapsed?: boolean;
  entity: T;
  entityWithExercises: HasExercises;
  onPointsSave: PointsSaveCallback;
  onEditPoints?: () => void;
}

export function convertPointsCardExerciseToPointMapEntry({
  comment,
  points,
}: PointsCardFormExerciseState): PointMapEntry {
  if (typeof points === 'string') {
    return {
      comment,
      points: points ? Number.parseFloat(points) : 0,
    };
  } else {
    const pointsOfSubexercises: PointsOfSubexercises = {};

    Object.entries(points).forEach(([subKey, value]) => {
      pointsOfSubexercises[subKey] = value ? Number.parseFloat(value) : 0;
    });

    return {
      comment,
      points: pointsOfSubexercises,
    };
  }
}

export function convertPointsCardFormStateToDTO(
  values: PointsCardFormState,
  exerciseContainer: HasExercises
): UpdatePointsDTO {
  const exercises: PointMap = new PointMap();

  Object.entries(values).forEach(([key, entry]) => {
    exercises.setPointsByKey(key, convertPointsCardExerciseToPointMapEntry(entry));
  });

  return {
    id: exerciseContainer.id,
    exercises: exercises.toDTO(),
  };
}

export function getInitialPointsCardValues(
  points: PointMap,
  { id, exercises }: HasExercises
): PointsCardFormState {
  const values: PointsCardFormState = {};

  exercises.forEach(ex => {
    const pointId = new PointId(id, ex);
    const entry = points.getPointEntry(pointId);

    if (entry) {
      let points: string | PointsCardFormSubExState;

      if (typeof entry.points === 'number') {
        points = entry.points.toString();
      } else {
        const tmpPoints: PointsCardFormSubExState = {};

        Object.entries(entry.points).forEach(([key, value]) => {
          tmpPoints[key] = value.toString();
        });

        points = tmpPoints;
      }

      values[pointId.toString()] = { points, comment: entry.comment };
    } else {
      if (ex.subexercises.length > 0) {
        const points: PointsCardFormSubExState = {};

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

function getAchievedPointsFromState(state: PointsCardFormState): number {
  return Object.values(state).reduce((sum, { points }) => {
    if (typeof points === 'string') {
      return sum + Number.parseFloat(points);
    }

    return Object.values(points).reduce((pts, value) => {
      return pts + Number.parseFloat(value);
    }, sum);
  }, 0);
}

function PointsCard<T extends EntityWithPoints>({
  name,
  avatar,
  title,
  subtitle,
  isCollapsed: isCollapsedProp,
  entity,
  entityWithExercises,
  onPointsSave,
  onEditPoints,
  className,
  ...other
}: Props<T>): JSX.Element {
  const classes = useStyles();
  const [isCollapsed, setCollapsed] = useState(
    isCollapsedProp !== undefined ? isCollapsedProp : true
  );

  const exercises: Exercise[] = entityWithExercises.exercises;

  const totalPoints: number = exercises.reduce((pts, ex) => pts + getPointsOfExercise(ex), 0);
  const initialValues: PointsCardFormState = getInitialPointsCardValues(
    entity.points,
    entityWithExercises
  );

  function handleCollapseChange(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setCollapsed(!isCollapsed);
  }

  function Header({ values }: { values: PointsCardFormState }) {
    return (
      <CustomCardHeader
        onClick={handleCollapseChange}
        className={classes.header}
        avatar={avatar}
        title={title}
        subheader={subtitle}
        midText={`Gesamt: ${getAchievedPointsFromState(values)} / ${totalPoints} Punkte`}
        action={
          <>
            {onEditPoints && (
              <IconButton
                onClick={e => {
                  e.stopPropagation();
                  onEditPoints();
                }}
              >
                <EditPointsIcon />
              </IconButton>
            )}

            <IconButton onClick={handleCollapseChange}>
              <OpenIcon
                className={clsx(classes.collpaseIcon, !isCollapsed && classes.collapseIconOpen)}
              />
            </IconButton>
          </>
        }
      />
    );
  }

  function Content({ namePrefix }: { namePrefix?: string }): JSX.Element {
    const prefix = namePrefix ? namePrefix + '.' : '';

    return (
      <CardContent className={classes.content}>
        {exercises.map(ex => (
          <ExerciseBox
            key={ex.id}
            name={prefix + new PointId(entityWithExercises.id, ex).toString()}
            exercise={ex}
          />
        ))}
      </CardContent>
    );
  }

  return (
    <Card {...other} className={clsx(className, classes.root)}>
      {!!name ? (
        <FormikConsumer>
          {({ values }) => (
            <>
              <Header values={values[name]} />

              <Content namePrefix={name} />
            </>
          )}
        </FormikConsumer>
      ) : (
        <Formik
          initialValues={initialValues}
          onSubmit={onPointsSave}
          // TODO: Add validation schema?!
        >
          {({ handleSubmit, isValid, isSubmitting, values }) => (
            <>
              <Header values={values} />

              {!isCollapsed && (
                <form onSubmit={handleSubmit}>
                  <Content />

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
      )}
    </Card>
  );
}

export default PointsCard;
