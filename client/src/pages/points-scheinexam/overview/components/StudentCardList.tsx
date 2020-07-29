import React from 'react';
import CardList from '../../../../components/cardlist/CardList';
import { Scheinexam } from '../../../../model/Scheinexam';
import { Student } from '../../../../model/Student';
import StudentCard from './StudentCard';
import Placeholder from '../../../../components/Placeholder';

interface Props {
  students: Student[];
  exam: Scheinexam;
  getPathTo: (student: Student) => string;
}

function StudentCardList({ students, exam, getPathTo }: Props): JSX.Element {
  return (
    <Placeholder
      placeholderText='Keine Studierenden verfügbar.'
      showPlaceholder={students.length === 0}
    >
      <CardList>
        {students.map((student) => (
          <StudentCard key={student.id} student={student} exam={exam} pathTo={getPathTo(student)} />
        ))}
      </CardList>
    </Placeholder>
  );
}

export default StudentCardList;
