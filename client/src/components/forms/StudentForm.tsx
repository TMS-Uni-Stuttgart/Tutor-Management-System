import { FormikHelpers } from 'formik';
import React, { useMemo, useRef } from 'react';
import { IStudentDTO, StudentStatus } from 'shared/model/Student';
import * as Yup from 'yup';
import { useSettings } from '../../hooks/useSettings';
import { Student } from '../../model/Student';
import { Team } from '../../model/Team';
import { FormikSubmitCallback } from '../../types';
import Placeholder from '../Placeholder';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import FormikWarningTextField from './components/FormikWarningTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

const validationSchema = Yup.object().shape({
  lastname: Yup.string().required('Benötigt'),
  firstname: Yup.string().required('Benötigt'),
  iliasName: Yup.string(),
  email: Yup.string().email('Keine gültige E-Mailadresse'),
  matriculationNo: Yup.string().test({
    test: function (this, matriculationNo: unknown) {
      if (matriculationNo === undefined || matriculationNo === '') {
        return true;
      }

      if (typeof matriculationNo !== 'string') {
        return this.createError({
          path: 'matriculationNo',
          message: 'Muss eine Zeichenkette sein.',
        });
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

export interface StudentFormState {
  lastname: string;
  firstname: string;
  iliasName: string;
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
  teams?: Team[];
}

interface InitialStateParams {
  teams?: Team[];
  student?: Student;
  defaultTeamSize: number;
}

export const CREATE_NEW_TEAM_VALUE = 'CREATE_NEW_TEAM_ACTION';
type ItemType = Team | { type: typeof CREATE_NEW_TEAM_VALUE };

export function convertFormStateToDTO(values: StudentFormState, tutorialId: string): IStudentDTO {
  const {
    firstname,
    lastname,
    iliasName,
    matriculationNo,
    email,
    courseOfStudies,
    team,
    status,
  } = values;

  return {
    firstname,
    lastname,
    iliasName,
    status,
    tutorial: tutorialId,
    matriculationNo: matriculationNo || undefined,
    email: email || undefined,
    courseOfStudies: courseOfStudies || undefined,
    team: team || undefined,
  };
}

function getNextTeamWithSlot(teams: Team[], defaultTeamSize: number): string {
  for (const team of teams) {
    if (team.students.length < defaultTeamSize) {
      return team.id;
    }
  }

  return CREATE_NEW_TEAM_VALUE;
}

export function getInitialStudentFormState({
  teams,
  student,
  defaultTeamSize,
}: InitialStateParams): StudentFormState {
  const team: string = student
    ? student.team?.id ?? ''
    : teams
    ? getNextTeamWithSlot(teams, defaultTeamSize)
    : '';

  return {
    lastname: student?.lastname ?? '',
    firstname: student?.firstname ?? '',
    iliasName: student?.iliasName ?? '',
    matriculationNo: student?.matriculationNo ?? '',
    email: student?.email || '',
    courseOfStudies: student?.courseOfStudies || '',
    team,
    status: student?.status ?? StudentStatus.ACTIVE,
  };
}

function parseTeamItemToString(team: ItemType): string {
  if ('type' in team) {
    return 'Neues Team erstellen';
  }

  return team.toString();
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
  const firstnameInputRef = useRef<HTMLElement>();

  const {
    settings: { defaultTeamSize },
    isLoadingSettings,
  } = useSettings();
  const initialFormState = useMemo(() => {
    return getInitialStudentFormState({ teams: teamsFromProps, student, defaultTeamSize });
  }, [teamsFromProps, student, defaultTeamSize]);

  const disableTeamDropdown = !teamsFromProps;
  const teams: ItemType[] = [{ type: CREATE_NEW_TEAM_VALUE }, ...(teamsFromProps ?? [])];

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
    <Placeholder
      loading={isLoadingSettings}
      showPlaceholder={isLoadingSettings}
      placeholderText='Lade Einstellungen...'
    >
      <FormikBaseForm
        {...other}
        initialValues={initialFormState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
        enableDebug
      >
        <FormikTextField name='firstname' label='Vorname' inputRef={firstnameInputRef} required />

        <FormikTextField name='lastname' label='Nachname' required />

        <FormikSelect
          name='status'
          label='Status'
          emptyPlaceholder='Keine Status vorhanden.'
          items={availableStatuses}
          itemToString={statusToString}
          itemToValue={(s) => s}
          required
        />

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

        <FormikWarningTextField
          name='matriculationNo'
          label='Matrikelnummer'
          type='number'
          warningLabel='Keine Matrikelnummer eingegeben.'
          FormikFieldProps={{
            validate: (value: any) => {
              if (!value) {
                return undefined;
              }

              for (const s of otherStudents) {
                if (s.matriculationNo && value === s.matriculationNo) {
                  return `Matrikelnummer wird bereits von ${s.nameFirstnameFirst} verwendet.`;
                }
              }

              return undefined;
            },
          }}
          inputProps={{
            min: 0,
          }}
        />

        <FormikWarningTextField
          name='iliasName'
          label='Ilias-Name'
          warningLabel='Kein Iliasname eingegeben.'
        />

        <FormikTextField name='email' label='E-Mailadresse' />

        <FormikTextField name='courseOfStudies' label='Studiengang' />
      </FormikBaseForm>
    </Placeholder>
  );
}

export default StudentForm;
