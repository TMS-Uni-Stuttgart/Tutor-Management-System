import { CircularProgress, IconButton, TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Person as PersonIcon } from '@material-ui/icons';
import { Formik } from 'formik';
import { Check as CheckIcon } from 'mdi-material-ui';
import React from 'react';
import * as Yup from 'yup';
import FormikTextField from '../../../components/forms/components/FormikTextField';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { FormikSubmitCallback } from '../../../types';
import { Sheet } from '../../../typings/RatingModel';
import { Student } from '../../../typings/ServerResponses';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textFieldContainer: {
      display: 'flex',
    },
    saveButton: {
      marginLeft: theme.spacing(1),
      color: theme.palette.green.dark,
      flexBasis: 56,
    },
  })
);

const validationSchema = Yup.object().shape({
  presentations: Yup.number()
    .required()
    .min(0, 'Muss 0 oder größer sein.'),
});

interface StudentPresentationFormState {
  presentations: number;
}

export type StudentPresentationPointsCallback = FormikSubmitCallback<StudentPresentationFormState>;

interface Props extends PaperTableRowProps {
  student: Student;
  onPointsSave: StudentPresentationPointsCallback;
  sheet: Sheet;
}

function StudentPresentationRow({ student, onPointsSave, sheet, ...rest }: Props): JSX.Element {
  const classes = useStyles();

  const initialValues: StudentPresentationFormState = {
    presentations: student.presentationPoints[sheet.id] || 0,
  };

  return (
    <PaperTableRow label={`${student.lastname}, ${student.firstname}`} icon={PersonIcon} {...rest}>
      <TableCell>
        <Formik
          onSubmit={onPointsSave}
          initialValues={initialValues}
          validationSchema={validationSchema}
        >
          {({ handleSubmit, isValid, isSubmitting }) => (
            <form onSubmit={handleSubmit} className={classes.textFieldContainer}>
              <FormikTextField
                name={`presentations`}
                label={`Anzahl Präsentationen`}
                // className={classes.exerciseTf}
                type='number'
                inputProps={{
                  min: 0,
                  step: 1,
                }}
                // InputProps={{
                //   endAdornment: `/ ${ex.maxPoints} Pkt.`,
                // }}
              />
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
    </PaperTableRow>
  );
}

export default StudentPresentationRow;
