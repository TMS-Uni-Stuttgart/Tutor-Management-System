import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Formik } from 'formik';
import React from 'react';
import { PointMap } from 'shared/dist/model/Points';
import { Exercise, Sheet } from 'shared/dist/model/Sheet';
import { Student } from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import SubmitButton from '../../../components/forms/components/SubmitButton';
import { FormikSubmitCallback } from '../../../types';
import { getNameOfEntity } from '../../../util/helperFunctions';
import { getExerciseIdentifier } from '../util/helper';
import PointsCard, {
  getInitialPointsCardValues,
  PointsCardFormState,
} from './points-card/PointsCard';

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

type EditStudentPointsFormState = {
  [studentId: string]: PointsCardFormState;
};

function getExerciseFieldName(student: Student, ex: Exercise): string {
  return `${student.id}.${getExerciseIdentifier(ex)}`;
}

function getInitialValues(team: Team, sheet: Sheet): EditStudentPointsFormState {
  const values: EditStudentPointsFormState = {};
  const pointsOfTeam = new PointMap(team.points);
  const formStateOfTeam = getInitialPointsCardValues(pointsOfTeam, sheet);

  for (const student of team.students) {
    const pointsOfStudent = new PointMap(student.points);
    const formStateOfStudent = getInitialPointsCardValues(pointsOfStudent, sheet);

    values[student.id] = {
      ...formStateOfTeam,
      ...formStateOfStudent,
    };
  }

  return values;
}

// TODO: Adjust for subexercises (including getInitialValues).
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
      initialValues={getInitialValues(team, sheet)}
      // validationSchema={validationSchema}
    >
      {({ handleSubmit, isValid, isSubmitting, values }) => (
        <>
          <form onSubmit={handleSubmit}>
            {team.students.map(student => (
              <PointsCard
                key={student.id}
                name={student.id}
                title={getNameOfEntity(student)}
                entity={{ id: student.id, points: new PointMap(student.points) }}
                entityWithExercises={sheet}
                onPointsSave={() => console.log('SAVE POINTS!')}
              />
            ))}
            {/* <Table>
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
                            key={getExerciseIdentifier(ex)}
                            name={getExerciseFieldName(student, ex)}
                            label={`Aufgabe ${ex.exName}`}
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
            </Table> */}

            <div className={classes.buttonBox}>
              <Button className={classes.cancelButton} onClick={onCancelClicked}>
                Abbrechen
              </Button>
              <SubmitButton color='primary' isSubmitting={isSubmitting} disabled={!isValid}>
                Speichern
              </SubmitButton>
            </div>

            <FormikDebugDisplay values={values} />
          </form>
        </>
      )}
    </Formik>
  );
}

export default EditStudentPointsDialogContent;
