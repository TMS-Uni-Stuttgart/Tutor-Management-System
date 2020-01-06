import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Formik } from 'formik';
import React from 'react';
import { PointMap } from 'shared/dist/model/Points';
import { Sheet } from 'shared/dist/model/Sheet';
import { Team } from 'shared/dist/model/Team';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import SubmitButton from '../../../components/forms/components/SubmitButton';
import { FormikSubmitCallback } from '../../../types';
import PointsCard, {
  getInitialPointsCardValues,
  PointsCardFormState,
} from './points-card/PointsCard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pointsCard: {
      marginTop: theme.spacing(2),
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
  onCancelClicked: () => void;
  onSaveClicked: EditStudentPointsCallback;
}

type EditStudentPointsFormState = {
  [studentId: string]: PointsCardFormState;
};

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

function EditStudentPointsDialogContent({
  team,
  sheet,
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
      {({ handleSubmit, isValid, isSubmitting }) => (
        <>
          <form onSubmit={handleSubmit}>
            {team.students.map(student => (
              <PointsCard
                key={student.id}
                name={student.id}
                className={classes.pointsCard}
                title={getNameOfEntity(student)}
                entity={{ id: student.id, points: student.points }}
                entityWithExercises={sheet}
                onPointsSave={() => console.log('SAVE POINTS!')}
              />
            ))}

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
