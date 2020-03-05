import React from 'react';
import CardList from '../../../../components/cardlist/CardList';
import { IStudent } from 'shared/model/Student';
import StudentCard from './StudentCard';
import { IScheinExam } from 'shared/model/Scheinexam';

interface Props {
  tutorialId: string;
  students: IStudent[];
  exam: IScheinExam;
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
