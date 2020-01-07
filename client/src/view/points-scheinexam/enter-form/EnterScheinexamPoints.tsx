import React from 'react';
import { useParams } from 'react-router';

interface RouteParams {
  tutorialId: string;
  examId: string;
  studentId: string;
}

function EnterScheinexamPoints(): JSX.Element {
  const { tutorialId, examId, studentId } = useParams<RouteParams>();

  return <div>IMPLEMENT ME</div>;
}

export default EnterScheinexamPoints;
