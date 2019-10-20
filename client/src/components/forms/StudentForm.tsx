import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AlertOutline as AlertIcon } from 'mdi-material-ui';
import React from 'react';
import { Team } from 'shared/dist/model/Team';
import * as Yup from 'yup';
import { FormikSubmitCallback } from '../../types';
import { StudentWithFetchedTeam } from '../../typings/types';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    warningColor: {
      color: theme.palette.warning.main,
    },
    warningBorder: {
      borderColor: theme.palette.warning.main,
    },
  })
);

const validationSchema = Yup.object().shape({
  lastname: Yup.string().required('Benötigt'),
  firstname: Yup.string().required('Benötigt'),
  email: Yup.string().email('Keine gültige E-Mailadresse'),
  matriculationNo: Yup.number().test({
    test: function(this, matriculationNo: number | undefined) {
      if (matriculationNo === undefined) {
        return true;
      }

      return matriculationNo.toString().length >= 6;
    },
    message: 'Muss mind. 6 Stellen haben',
  }),
});

export type StudentFormSubmitCallback = FormikSubmitCallback<StudentFormState>;

interface StudentFormState {
  lastname: string;
  firstname: string;
  matriculationNo: string;
  email: string;
  courseOfStudies: string;
  team?: string;
}

interface Props extends Omit<FormikBaseFormProps<StudentFormState>, CommonlyUsedFormProps> {
  onSubmit: StudentFormSubmitCallback;
  student?: StudentWithFetchedTeam;
  teams: Team[];
  disableTeamDropdown?: boolean;
}

export const CREATE_NEW_TEAM_ID = 'CREATE_NEW_TEAM_ACTION';
type ItemType = Team | { type: typeof CREATE_NEW_TEAM_ID };

function getInitialFormState(student?: StudentWithFetchedTeam): StudentFormState {
  if (student) {
    return {
      lastname: student.lastname,
      firstname: student.firstname,
      matriculationNo: student.matriculationNo !== undefined ? student.matriculationNo : '',
      email: student.email || '',
      courseOfStudies: student.courseOfStudies || '',
      team: student.team ? student.team.id : '',
    };
  }

  return {
    lastname: '',
    firstname: '',
    matriculationNo: '',
    email: '',
    courseOfStudies: '',
    team: '',
  };
}

function teamItemToString(team: ItemType): string {
  if ('type' in team) {
    return 'Neues Team erstellen';
  }

  const studentsInTeam = team.students.length
    ? `(${team.students.map(student => student.lastname).join(', ')})`
    : '';

  return `#${team.teamNo.toString().padStart(2, '0')} ${studentsInTeam}`;
}

function teamItemToValue(team: ItemType): string {
  if ('type' in team) {
    return CREATE_NEW_TEAM_ID;
  }

  return team.id;
}

function StudentForm({
  teams: teamsFromProps,
  onSubmit,
  className,
  student,
  disableTeamDropdown,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();
  const initialFormState = getInitialFormState(student);

  const teams: ItemType[] = [{ type: CREATE_NEW_TEAM_ID }, ...teamsFromProps];

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormState}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <>
          <FormikTextField name='firstname' label='Vorname' required />

          <FormikTextField name='lastname' label='Nachname' required />

          <FormikTextField
            name='matriculationNo'
            label='Matrikelnummer'
            type='number'
            inputProps={{
              min: 0,
            }}
            helperText={
              values['matriculationNo'] === '' ? 'Keine Matrikelnummer eingegeben.' : undefined
            }
            InputProps={{
              endAdornment:
                values['matriculationNo'] === '' ? (
                  <AlertIcon className={classes.warningColor} />
                ) : (
                  undefined
                ),
              classes: {
                notchedOutline:
                  values['matriculationNo'] === '' ? classes.warningBorder : undefined,
              },
            }}
            InputLabelProps={{
              classes: {
                root: values['matriculationNo'] === '' ? classes.warningColor : undefined,
              },
            }}
            FormHelperTextProps={{
              classes: {
                root: values['matriculationNo'] === '' ? classes.warningColor : undefined,
              },
            }}
          />

          <FormikTextField name='email' label='E-Mailadresse' />

          <FormikTextField name='courseOfStudies' label='Studiengang' />

          <FormikSelect
            name='team'
            label='Team'
            emptyPlaceholder='Keine Teams vorhanden.'
            nameOfNoneItem='Kein Team'
            items={teams}
            itemToString={teamItemToString}
            itemToValue={teamItemToValue}
            disabled={disableTeamDropdown}
          />
        </>
      )}
    </FormikBaseForm>
  );
}

export default StudentForm;
