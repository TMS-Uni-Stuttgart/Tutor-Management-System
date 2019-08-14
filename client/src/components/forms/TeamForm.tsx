import React from 'react';
import { FormikSubmitCallback } from '../../types';
import { StudentWithFetchedTeam } from '../../typings/types';
import FormikFilterableSelect from './components/FormikFilterableSelect';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';
import { Team } from '../../typings/ServerResponses';

export type TeamFormSubmitCallback = FormikSubmitCallback<TeamFormState>;

interface TeamFormState {
  filter: string;
  teamNo: number;
  students: string[];
}

interface Props extends Omit<FormikBaseFormProps<TeamFormState>, CommonlyUsedFormProps> {
  team?: Team;
  onSubmit: TeamFormSubmitCallback;
  students: StudentWithFetchedTeam[];
}

function getInitialFormState(team?: Team): TeamFormState {
  if (team) {
    return {
      filter: '',
      teamNo: team.teamNo,
      students: team.students.map(student => student.id),
    };
  }

  return {
    filter: '',
    teamNo: 0,
    students: [],
  };
}

function TeamForm({ students, onSubmit, team, ...other }: Props): JSX.Element {
  return (
    <FormikBaseForm {...other} initialValues={getInitialFormState(team)} onSubmit={onSubmit}>
      {({ values }) => (
        <>
          <FormikFilterableSelect
            name='students'
            label='Studierende'
            emptyPlaceholder='Keine Studierenden vorhanden.'
            filterPlaceholder='Suche nach Namen'
            items={students}
            itemToString={student => `${student.lastname}, ${student.firstname}`}
            itemToValue={student => student.id}
            isItemSelected={student => values['students'].indexOf(student.id) > -1}
            style={{ gridColumn: '1 / span 2' }}
          />
        </>
      )}
    </FormikBaseForm>
  );
}

export default TeamForm;
