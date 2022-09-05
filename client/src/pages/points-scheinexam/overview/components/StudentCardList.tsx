import React from 'react';
import CardList from '../../../../components/cardlist/CardList';
import { Scheinexam } from '../../../../model/Scheinexam';
import { Student } from '../../../../model/Student';
import StudentCard from './StudentCard';
import Placeholder from '../../../../components/Placeholder';
import { GradingList } from '../../../../model/GradingList';

interface Props {
  students: Student[];
  exam: Scheinexam;
  gradings: GradingList;
  getPathTo: (student: Student) => string;
}

function StudentCardList({ students, gradings, exam, getPathTo }: Props): JSX.Element {
  return (
    <Placeholder
      placeholderText='Keine Studierenden verfügbar.'
      showPlaceholder={students.length === 0}
    >
      <CardList>
        {students.map((student) => {
          const grading = gradings.getGradingOfStudent(student.id);

          return (
            <StudentCard
              key={student.id}
              student={student}
              grading={grading}
              exam={exam}
              pathTo={getPathTo(student)}
            />
          );
        })}
      </CardList>
    </Placeholder>
  );
}

export default StudentCardList;
