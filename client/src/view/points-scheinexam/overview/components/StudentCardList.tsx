import React from 'react';
import CardList from '../../../../components/cardlist/CardList';
import { Scheinexam } from '../../../../model/Scheinexam';
import { Student } from '../../../../model/Student';
import StudentCard from './StudentCard';

interface Props {
  tutorialId: string;
  students: Student[];
  exam: Scheinexam;
}

function StudentCardList({ students, tutorialId, exam }: Props): JSX.Element {
  return (
    <CardList>
      {students.map(student => (
        <StudentCard key={student.id} student={student} exam={exam} tutorialId={tutorialId} />
      ))}
    </CardList>
  );
}

export default StudentCardList;
