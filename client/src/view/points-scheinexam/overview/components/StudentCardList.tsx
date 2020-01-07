import React from 'react';
import CardList from '../../../../components/cardlist/CardList';
import { Student } from 'shared/dist/model/Student';

interface Props {
  students: Student[];
}

function StudentCardList({ students }: Props): JSX.Element {
  return (
    <CardList>
      {students.map(s => (
        <div key={s.id}>{s.id}</div>
      ))}
    </CardList>
  );
}

export default StudentCardList;
