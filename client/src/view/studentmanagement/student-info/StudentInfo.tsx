import React from 'react';
import { useParams } from 'react-router';

interface RouteParams {
  studentId: string;
}

function StudentInfo(): JSX.Element {
  const { studentId } = useParams<RouteParams>();

  return <div>{studentId}</div>;
}

export default StudentInfo;
