import React from 'react';
import * as Yup from 'yup';
import { FormikSubmitCallback } from '../../types';
import { StudentWithFetchedTeam } from '../../typings/types';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';
import { Team } from '../../typings/ServerResponses';

const validationSchema = Yup.object().shape({
  lastname: Yup.string().required('Benötigt'),
  firstname: Yup.string().required('Benötigt'),
  email: Yup.string().email('Keine gültige E-Mailadresse'),
  matriculationNo: Yup.number()
    .required('Benötigt')
    .test({
      test: function(this, matriculationNo: number) {
        return !!matriculationNo && matriculationNo.toString().length === 7;
      },
      message: 'Muss siebenstellig sein',
    }),
});

export type StudentFormSubmitCallback = FormikSubmitCallback<StudentFormState>;

interface StudentFormState {
  lastname: string;
  firstname: string;
  matriculationNo: number;
  email: string;
  courseOfStudies: string;
  team: string;
}

interface Props extends Omit<FormikBaseFormProps<StudentFormState>, CommonlyUsedFormProps> {
  onSubmit: StudentFormSubmitCallback;
  student?: StudentWithFetchedTeam;
  teams: Team[];
  disableTeamDropdown?: boolean;
}

function getInitialFormState(student?: StudentWithFetchedTeam): StudentFormState {
  if (student) {
    console.log(student);

    return {
      lastname: student.lastname,
      firstname: student.firstname,
      matriculationNo: Number.parseInt(student.matriculationNo),
      email: student.email,
      courseOfStudies: student.courseOfStudies,
      team: student.team ? student.team.id : '',
    };
  }

  return {
    lastname: '',
    firstname: '',
    matriculationNo: 0,
    email: '',
    courseOfStudies: '',
    team: '',
  };
}

function StudentForm({
  teams,
  onSubmit,
  className,
  student,
  disableTeamDropdown,
  ...other
}: Props): JSX.Element {
  const initialFormState = getInitialFormState(student);

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormState}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <FormikTextField name='firstname' label='Vorname' />

      <FormikTextField name='lastname' label='Nachname' />

      <FormikTextField
        name='matriculationNo'
        label='Matrikelnummer'
        type='number'
        inputProps={{
          min: 0,
        }}
      />

      <FormikTextField name='email' label='E-Mailadresse' />

      <FormikTextField name='courseOfStudies' label='Studiengang' />

      <FormikSelect
        name='team'
        label='Team'
        emptyPlaceholder='Keine Teams vorhanden.'
        items={teams}
        itemToString={team =>
          `#${team.teamNo.toString().padStart(2, '0')} ${
            team.students.length
              ? `(${team.students.map(student => student.lastname).join(', ')})`
              : ''
          }`
        }
        itemToValue={team => team.id}
        disabled={disableTeamDropdown}
      />
    </FormikBaseForm>
  );
}

export default StudentForm;
