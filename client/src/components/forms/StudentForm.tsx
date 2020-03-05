import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FormikHelpers } from 'formik';
import { AlertOutline as AlertIcon } from 'mdi-material-ui';
import React, { useRef } from 'react';
import { StudentStatus } from 'shared/model/Student';
import { getNameOfEntity } from 'shared/util/helpers';
import * as Yup from 'yup';
import { Student } from '../../model/Student';
import { FormikSubmitCallback } from '../../types';
import { teamItemToString } from '../../util/helperFunctions';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';
import { Team } from '../../model/Team';

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
  matriculationNo: Yup.string().test({
    test: function(this, matriculationNo: string | undefined) {
      if (matriculationNo === undefined || matriculationNo === '') {
        return true;
      }

      if (Number.isNaN(Number.parseInt(matriculationNo, 10))) {
        return this.createError({
          path: 'matriculationNo',
          message: 'Muss eine Zahl sein',
        });
      }

      return matriculationNo.length >= 6;
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
  status: StudentStatus;
  team?: string;
}

interface Props extends Omit<FormikBaseFormProps<StudentFormState>, CommonlyUsedFormProps> {
  onSubmit: StudentFormSubmitCallback;
  student?: Student;
  otherStudents: Student[];
  teams?: ITeam[];
}

export const CREATE_NEW_TEAM_VALUE = 'CREATE_NEW_TEAM_ACTION';
type ItemType = ITeam | { type: typeof CREATE_NEW_TEAM_VALUE };

function getMaxTeamSize() {
  // TODO: Replace with settings after settings are implemented.
  return 2;
}

function getNextTeamWithSlot(teams: ITeam[]): string {
  const maxTeamSize = getMaxTeamSize();

  for (const team of teams) {
    if (team.students.length < maxTeamSize) {
      return team.id;
    }
  }

  return CREATE_NEW_TEAM_VALUE;
}

export function getInitialStudentFormState(teams?: Team[], student?: Student): StudentFormState {
  if (student) {
    return {
      lastname: student.lastname,
      firstname: student.firstname,
      matriculationNo: student.matriculationNo !== undefined ? student.matriculationNo : '',
      email: student.email || '',
      courseOfStudies: student.courseOfStudies || '',
      team: student.team ? student.team.id : '',
      status: student.status,
    };
  }

  return {
    lastname: '',
    firstname: '',
    matriculationNo: '',
    email: '',
    courseOfStudies: '',
    status: StudentStatus.ACTIVE,
    team: teams ? getNextTeamWithSlot(teams) : '',
  };
}

function parseTeamItemToString(team: ItemType): string {
  if ('type' in team) {
    return 'Neues Team erstellen';
  }

  return teamItemToString(team);
}

function teamItemToValue(team: ItemType): string {
  if ('type' in team) {
    return CREATE_NEW_TEAM_VALUE;
  }

  return team.id;
}

function statusToString(status: StudentStatus): string {
  switch (status) {
    case StudentStatus.ACTIVE:
      return 'Aktiv';

    case StudentStatus.INACTIVE:
      return 'Inaktiv';

    case StudentStatus.NO_SCHEIN_REQUIRED:
      return 'Hat bereits einen Schein';

    default:
      return 'NO_STRING_FOR_STATUS_FOUND';
  }
}

function StudentForm({
  teams: teamsFromProps,
  onSubmit,
  className,
  student,
  otherStudents,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();
  const firstnameInputRef = useRef<HTMLElement>();
  const initialFormState = getInitialStudentFormState(teamsFromProps, student);

  const disableTeamDropdown = !teamsFromProps;
  const teams: ItemType[] = [{ type: CREATE_NEW_TEAM_VALUE }, ...(teamsFromProps || [])];

  async function handleSubmit(
    values: StudentFormState,
    formikHelpers: FormikHelpers<StudentFormState>
  ) {
    // onSubmit might be a promise so we wrap it here with the promise library. This handles Promises and non-Promises alike.
    await Promise.resolve(onSubmit(values, formikHelpers));

    if (firstnameInputRef.current) {
      firstnameInputRef.current.focus();
    }
  }

  const availableStatuses = Object.values(StudentStatus);

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormState}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableDebug
    >
      {({ values }) => (
        <>
          <FormikTextField name='firstname' label='Vorname' inputRef={firstnameInputRef} required />

          <FormikTextField name='lastname' label='Nachname' required />

          <FormikTextField
            name='matriculationNo'
            label='Matrikelnummer'
            type='number'
            FormikFieldProps={{
              validate: (value: any) => {
                if (!value) {
                  return undefined;
                }

                for (const s of otherStudents) {
                  if (s.matriculationNo && value === s.matriculationNo) {
                    return `Matrikelnummer wird bereits von ${getNameOfEntity(s, {
                      firstNameFirst: true,
                    })} verwendet.`;
                  }
                }

                return undefined;
              },
            }}
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
            itemToString={parseTeamItemToString}
            itemToValue={teamItemToValue}
            disabled={disableTeamDropdown}
          />

          <FormikSelect
            name='status'
            label='Status'
            emptyPlaceholder='Keine Status vorhanden.'
            items={availableStatuses}
            itemToString={statusToString}
            itemToValue={s => s}
          />
        </>
      )}
    </FormikBaseForm>
  );
}

export default StudentForm;
