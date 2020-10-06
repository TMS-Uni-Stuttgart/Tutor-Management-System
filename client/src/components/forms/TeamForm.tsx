import React from 'react';
import { StudentInTeam } from '../../model/Student';
import { Team } from '../../model/Team';
import { FormikSubmitCallback } from '../../types';
import FormikFilterableSelect from './components/FormikFilterableSelect';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

export type TeamFormSubmitCallback = FormikSubmitCallback<TeamFormState>;

interface TeamFormState {
  filter: string;
  teamNo: number;
  students: string[];
}

interface Props extends Omit<FormikBaseFormProps<TeamFormState>, CommonlyUsedFormProps> {
  team?: Team;
  onSubmit: TeamFormSubmitCallback;
  students: StudentInTeam[];
}

function getInitialFormState(team?: Team): TeamFormState {
  if (team) {
    return {
      filter: '',
      teamNo: team.teamNo,
      students: team.students.map((student) => student.id),
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
      <FormikFilterableSelect
        name='students'
        label='Studierende'
        emptyPlaceholder='Keine Studierenden vorhanden.'
        filterPlaceholder='Suche nach Namen'
        items={students}
        itemToString={(student) => student.name}
        itemToValue={(student) => student.id}
        minHeight={400}
        gridColumn='1 / span 2'
      />
    </FormikBaseForm>
  );
}

export default TeamForm;
