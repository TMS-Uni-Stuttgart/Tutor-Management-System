import { CircularProgress, IconButton, TableCell, Tooltip } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { SvgIconComponent } from '@material-ui/icons';
import clsx from 'clsx';
import { Formik } from 'formik';
import { Check as CheckIcon, TableEdit as TableEditIcon } from 'mdi-material-ui';
import React from 'react';
import { HasId } from 'shared/dist/model/Common';
import { HasExercises } from 'shared/dist/model/Sheet';
import * as Yup from 'yup';
import FormikTextField from '../../../components/forms/components/FormikTextField';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { FormikSubmitCallback } from '../../../types';
import { HasPoints } from '../../../typings/types';
import { getExerciseIdentifier, getInitialValues, PointsMap } from '../util/helper';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    exerciseBox: {
      display: 'flex',
    },
    exerciseTf: {
      marginRight: theme.spacing(2),
      flex: 1,
      '& input': {
        textAlign: 'right',
      },
    },
    saveButton: {
      marginLeft: 'auto',
      color: theme.palette.green.dark,
      flexBasis: 56,
    },
    showInfoIcon: {
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      transform: 'rotate(0deg)',
    },
    showInfoIconOpened: {
      transform: 'rotate(-180deg)',
    },
  })
);

const validationSchema = Yup.lazy((obj: any) =>
  Yup.object(
    Object.keys(obj).reduce<{ [key: string]: Yup.NumberSchema }>((shape, key) => {
      return {
        ...shape,
        [key]: Yup.number()
          .required('Benötigt')
          .min(0, 'Muss mind. 0 sein'),
      };
    }, {})
  )
);

export interface PointRowFormState {
  [key: string]: number;
}

export type PointsSaveCallback = FormikSubmitCallback<PointRowFormState>;
export type EntityWithPoints = HasId & HasPoints;

export interface PointsRowProps<T extends EntityWithPoints> extends PaperTableRowProps {
  label: string;
  subText?: string;
  icon?: SvgIconComponent;
  entity: T;
  pointsMap: PointsMap;
  entityWithExercises: HasExercises;
  tabIndexForRow: number;
  onPointsSave: PointsSaveCallback;
  onEditPoints?: (entity: T) => void;
}

function PointsRow<T extends EntityWithPoints>({
  entity,
  label,
  subText,
  icon,
  entityWithExercises,
  tabIndexForRow,
  onPointsSave,
  onEditPoints,
  pointsMap,
  ...rest
}: PointsRowProps<T>): JSX.Element {
  const classes = useStyles();
  const exercises = entityWithExercises.exercises;

  const initialValuesOfTeam = getInitialValues(pointsMap, entityWithExercises);

  return (
    <PaperTableRow label={label} subText={subText} icon={icon} {...rest}>
      <TableCell>
        <Formik
          onSubmit={onPointsSave}
          initialValues={initialValuesOfTeam}
          validationSchema={validationSchema}
        >
          {({ handleSubmit, isValid, isSubmitting }) => (
            <form onSubmit={handleSubmit} className={classes.exerciseBox}>
              {exercises.map(ex => (
                <FormikTextField
                  key={ex.exNo}
                  name={getExerciseIdentifier(ex)}
                  label={`Aufgabe ${ex.exNo}`}
                  className={classes.exerciseTf}
                  type='number'
                  inputProps={{
                    tabIndex: tabIndexForRow,
                    min: 0,
                    step: 0.1,
                    max: ex.maxPoints,
                  }}
                  InputProps={{
                    endAdornment: `/ ${ex.maxPoints} Pkt.`,
                  }}
                />
              ))}

              <IconButton
                type='submit'
                className={classes.saveButton}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : <CheckIcon />}
              </IconButton>
            </form>
          )}
        </Formik>
      </TableCell>

      {onEditPoints && (
        <TableCell align='right'>
          <Tooltip title='Punkte für Studierende anpassen'>
            <IconButton
              className={clsx(classes.showInfoIcon)}
              onClick={e => {
                e.stopPropagation();
                onEditPoints(entity);
              }}
            >
              <TableEditIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
    </PaperTableRow>
  );
}

export default PointsRow;
