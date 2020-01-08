import React from 'react';
import CardList from '../../../../components/cardlist/CardList';
import { Student } from 'shared/dist/model/Student';
import StudentCard from './StudentCard';
import { ScheinExam } from 'shared/dist/model/Scheinexam';

interface Props {
  tutorialId: string;
  students: Student[];
  exam: ScheinExam;
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
