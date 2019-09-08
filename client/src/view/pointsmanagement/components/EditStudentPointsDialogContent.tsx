import { Button, Table, TableBody, TableCell, TableRow, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Formik } from 'formik';
import React from 'react';
import FormikTextField from '../../../components/forms/components/FormikTextField';
import SubmitButton from '../../../components/forms/components/SubmitButton';
import { FormikSubmitCallback } from '../../../types';
import { Exercise, Sheet } from '../../../typings/RatingModel';
import { Student, Team } from '../../../typings/ServerResponses';
import { getExerciseIdentifier, getExercisePointsIdentifier } from '../util/helper';

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
    buttonBox: {
      marginTop: theme.spacing(2),
      display: 'flex',
    },
    cancelButton: {
      marginLeft: 'auto',
      marginRight: theme.spacing(1),
    },
  })
);

// const validationSchema = Yup.lazy((obj: any) =>
//   Yup.object(
//     Object.keys(obj).reduce<{ [key: string]: Yup.NumberSchema }>((shape, key) => {
//       return {
//         ...shape,
//         [key]: Yup.number()
//           .required('Benötigt')
//           .min(0, 'Muss mind. 0 sein'),
//       };
//     }, {})
//   )
// );

export type EditStudentPointsCallback = FormikSubmitCallback<EditStudentPointsFormState>;

interface Props {
  team: Team;
  sheet: Sheet;
  exercises: Exercise[];
  onCancelClicked: () => void;
  onSaveClicked: EditStudentPointsCallback;
}

interface EditStudentPointsFormState {
  [studentId: string]: { [exNo: string]: number };
}

function getExerciseFieldName(student: Student, ex: Exercise): string {
  return `${student.id}.${ex.exNo}`;
}

function getInitialValues(
  team: Team,
  sheet: Sheet,
  exercises: Exercise[]
): EditStudentPointsFormState {
  const values: EditStudentPointsFormState = {};

  for (const student of team.students) {
    values[student.id] = {};

    for (const ex of exercises) {
      const identifier = getExercisePointsIdentifier(sheet, ex);

      if (student.points[identifier] !== undefined) {
        values[student.id][getExerciseIdentifier(ex)] = student.points[identifier];
      } else {
        values[student.id][getExerciseIdentifier(ex)] = team.points[identifier] || 0;
      }
    }
  }

  return values;
}

function EditStudentPointsDialogContent({
  team,
  sheet,
  exercises,
  onSaveClicked,
  onCancelClicked,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Formik
      onSubmit={onSaveClicked}
      initialValues={getInitialValues(team, sheet, exercises)}
      // validationSchema={validationSchema}
    >
      {({ handleSubmit, isValid, isSubmitting }) => (
        <>
          <form onSubmit={handleSubmit}>
            <Table>
              <TableBody>
                {team.students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Typography>{`${student.lastname}, ${student.firstname}`}</Typography>
                    </TableCell>

                    <TableCell>
                      <div className={classes.exerciseBox}>
                        {exercises.map(ex => (
                          <FormikTextField
                            key={ex.exNo}
                            name={getExerciseFieldName(student, ex)}
                            label={`Aufgabe ${ex.exNo}`}
                            fullWidth={false}
                            type='number'
                            className={classes.exerciseTf}
                            inputProps={{
                              min: 0,
                              step: 0.1,
                            }}
                            InputProps={{
                              endAdornment: (
                                <Typography
                                  noWrap
                                  style={{ overflow: 'unset' }}
                                >{`/ ${ex.maxPoints} Pkt.`}</Typography>
                              ),
                            }}
                          />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className={classes.buttonBox}>
              <Button className={classes.cancelButton} onClick={onCancelClicked}>
                Abbrechen
              </Button>
              <SubmitButton color='primary' isSubmitting={isSubmitting} disabled={!isValid}>
                Speichern
              </SubmitButton>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
}

export default EditStudentPointsDialogContent;
