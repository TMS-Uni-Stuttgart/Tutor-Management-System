import {
  Marker as DisallowEmptyMatrNoIcon,
  MarkerCancel as AllowEmptyMatrNoIcon,
} from 'mdi-material-ui';
import React from 'react';
import { Team } from 'shared/dist/model/Team';
import * as Yup from 'yup';
import { FormikSubmitCallback } from '../../types';
import { StudentWithFetchedTeam } from '../../typings/types';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import { FormikTextFieldWithButtons } from './components/FormikTextFieldWithButtons';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

const validationSchema = Yup.object().shape({
  lastname: Yup.string().required('Benötigt'),
  firstname: Yup.string().required('Benötigt'),
  email: Yup.string().email('Keine gültige E-Mailadresse'),
  matriculationNo: Yup.number().test({
    test: function(this, matriculationNo: number) {
      const allowEmptyMatrNo = this.resolve(Yup.ref('allowEmptyMatrNo'));

      if (allowEmptyMatrNo) {
        return true;
      }

      return !!matriculationNo && matriculationNo.toString().length >= 6;
    },
    message: 'Muss mind. 6 Stellen haben',
  }),
});

export type StudentFormSubmitCallback = FormikSubmitCallback<StudentFormState>;

interface StudentFormState {
  lastname: string;
  firstname: string;
  allowEmptyMatrNo: boolean;
  matriculationNo: number | '';
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
    return {
      lastname: student.lastname,
      firstname: student.firstname,
      allowEmptyMatrNo: student.matriculationNo === undefined,
      matriculationNo:
        student.matriculationNo !== undefined ? Number.parseInt(student.matriculationNo) : '',
      email: student.email || '',
      courseOfStudies: student.courseOfStudies || '',
      team: student.team ? student.team.id : '',
    };
  }

  return {
    lastname: '',
    firstname: '',
    allowEmptyMatrNo: false,
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
      {({ setFieldValue, values }) => (
        <>
          <FormikTextField name='firstname' label='Vorname' />

          <FormikTextField name='lastname' label='Nachname' />

          <FormikTextFieldWithButtons
            name='matriculationNo'
            label='Matrikelnummer'
            type='number'
            inputProps={{
              min: 0,
            }}
            buttons={[
              {
                key: 'allowEmptMatrNo',
                Icon: values.allowEmptyMatrNo ? AllowEmptyMatrNoIcon : DisallowEmptyMatrNoIcon,
                color: values.allowEmptyMatrNo ? 'secondary' : 'default',
                tooltip: values.allowEmptyMatrNo
                  ? 'Keine Matrikelnummer benötigt.'
                  : 'Matrikelnummer benötigt',
                onClick: () => setFieldValue('allowEmptyMatrNo', !values.allowEmptyMatrNo),
              },
            ]}
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
        </>
      )}
    </FormikBaseForm>
  );
}

export default StudentForm;
