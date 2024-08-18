import { useParams } from 'react-router';
import AttendanceManager from './AttendanceManager';

interface Params {
  tutorialId: string;
  [key: string]: string | undefined;
}

function AttendanceView(): JSX.Element {
  const { tutorialId } = useParams<Params>();

  return <AttendanceManager tutorial={tutorialId} />;
}

export default AttendanceView;
