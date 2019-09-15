import {
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  TextField,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { OutlinedTextFieldProps } from '@material-ui/core/TextField';
import clsx from 'clsx';
import { ChevronUp as OpenIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { Exercise, getPointsOfExercise } from 'shared/dist/model/Sheet';
import CustomCardHeader from '../../../components/CustomCardHeader';
import SubmitButton from '../../../components/forms/components/SubmitButton';

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
    exerciseBox: {
      display: 'grid',
      position: 'relative',
      gridTemplateColumns: '250px 1fr',
      gridColumnGap: theme.spacing(2),
      gridRowGap: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
      marginBottom: theme.spacing(2),
      '&:last-of-type': {
        marginBottom: 0,
      },
    },
    exerciseBoxCollapseButton: {
      position: 'absolute',
      top: 4,
      right: theme.spacing(1),
    },
    exerciseHeader: {
      display: 'flex',
      alignItems: 'center',
    },
    exerciseName: {
      flex: 1,
    },
    firstColumn: {
      gridColumn: '1',
    },
    subexerciseTextFieldContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    subexerciseName: {
      marginRight: theme.spacing(1),
    },
    pointsTextField: {
      '& input': {
        width: 'unset',
        flex: 1,
        textAlign: 'right',
      },
    },
    commentaryTextField: {
      gridColumn: '2',
    },
  })
);

interface Props {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  isCollapsed?: boolean;
}

interface PointsTextFieldProps extends Omit<OutlinedTextFieldProps, 'variant' | 'type'> {
  points: string;
}

function PointsTextField({ points, InputProps, ...other }: PointsTextFieldProps): JSX.Element {
  return (
    <TextField
      {...other}
      variant='outlined'
      type='number'
      // inputProps={{
      //   tabIndex: tabIndexForRow,
      //   min: 0,
      //   step: 0.1,
      //   max: ex.maxPoints,
      // }}
      InputProps={{
        ...InputProps,
        endAdornment: <Typography variant='body2' noWrap>{`/ ${points} Pkt.`}</Typography>,
      }}
    />
  );
}

function PointsCard({ avatar, title, subtitle, isCollapsed: isCollapsedProp }: Props): JSX.Element {
  const classes = useStyles();
  const [isCollapsed, setCollapsed] = useState(
    isCollapsedProp !== undefined ? isCollapsedProp : true
  );

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
              <div key={ex.id} className={classes.exerciseBox}>
                <IconButton size='small' className={classes.exerciseBoxCollapseButton}>
                  <OpenIcon />
                </IconButton>

                <div className={classes.exerciseHeader}>
                  <Typography className={classes.exerciseName}>{`Aufgabe ${ex.exName}`}</Typography>
                  <Typography variant='body2' color='textSecondary'>{`## / ${getPointsOfExercise(
                    ex
                  )} Punkte`}</Typography>
                </div>

                <Typography>Kommentar</Typography>

                {ex.subexercises.length > 0 ? (
                  ex.subexercises.map(subEx => (
                    <div
                      key={subEx.id}
                      className={clsx(classes.subexerciseTextFieldContainer, classes.firstColumn)}
                    >
                      <Typography className={classes.subexerciseName}>{subEx.exName}</Typography>

                      <PointsTextField
                        className={classes.pointsTextField}
                        placeholder='0'
                        points={getPointsOfExercise(subEx).toString()}
                      />
                    </div>
                  ))
                ) : (
                  <PointsTextField
                    className={clsx(classes.pointsTextField, classes.firstColumn)}
                    placeholder='0'
                    points={getPointsOfExercise(ex).toString()}
                  />
                )}

                <TextField
                  className={classes.commentaryTextField}
                  style={{
                    gridRow: `2 / span ${
                      ex.subexercises.length > 0 ? ex.subexercises.length + 1 : 2
                    }`,
                  }}
                  placeholder='Kommentar'
                  variant='outlined'
                  multiline
                />
              </div>
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
