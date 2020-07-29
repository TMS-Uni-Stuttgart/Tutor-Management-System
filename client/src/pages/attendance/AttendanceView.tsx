import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import AttendanceManager from './AttendanceManager';

interface Params {
  tutorialId: string;
}

type Props = RouteComponentProps<Params>;

function AttendanceView({ match }: Props): JSX.Element {
  const {
    params: { tutorialId },
  } = match;

  return <AttendanceManager tutorial={tutorialId} />;
}

export default withRouter(AttendanceView);
