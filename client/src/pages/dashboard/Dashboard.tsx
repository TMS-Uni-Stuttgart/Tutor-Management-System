import { Box, Button, Divider } from '@material-ui/core';
import React from 'react';
import { Role } from 'shared/model/Role';
import { ScheincriteriaSummaryByStudents } from 'shared/model/ScheinCriteria';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import Placeholder from '../../components/Placeholder';
import { getScheinCriteriaSummariesOfAllStudentsOfTutorial } from '../../hooks/fetching/Scheincriteria';
import {
  getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots,
  getTutorial,
} from '../../hooks/fetching/Tutorial';
import { useLogin } from '../../hooks/LoginService';
import { useFetchState } from '../../hooks/useFetchState';
import { LoggedInUser } from '../../model/LoggedInUser';
import { Tutorial } from '../../model/Tutorial';
import AdminStatsCard from './components/AdminStatsCard';
import AllTutorialStatistics from './components/AllTutorialStatistics';
import TutorialStatistics from './components/TutorialStatistics';

export interface TutorialSummaryInfo {
  tutorial: Tutorial;
  studentInfos: ScheincriteriaSummaryByStudents;
}

function isAdmin(userData: LoggedInUser | undefined): boolean {
  return !!userData && userData.roles.includes(Role.ADMIN);
}

async function getTutorialSummariesForUser(
  userData: LoggedInUser | undefined
): Promise<TutorialSummaryInfo[]> {
  if (!userData) {
    return [];
  }

  const summaries: TutorialSummaryInfo[] = [];

  for (const loggedInTutorial of userData.tutorials) {
    const tutorial = await getTutorial(loggedInTutorial.id);
    const studentInfos = await getScheinCriteriaSummariesOfAllStudentsOfTutorial(
      loggedInTutorial.id
    );

    summaries.push({ tutorial, studentInfos });
  }

  return summaries;
}

function Dashboard(): JSX.Element {
  const { userData } = useLogin();

  const [tutorialsWithScheinCriteriaSummaries, isLoadingTutorialSummaries] = useFetchState({
    fetchFunction: getTutorialSummariesForUser,
    immediate: true,
    params: [userData],
  });

  const [summaries, isLoadingAdminGraph, , fetchSummaries] = useFetchState({
    fetchFunction: getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots,
  });

  return (
    <div>
      {isLoadingTutorialSummaries ? (
        <LoadingSpinner />
      ) : (
        <>
          {isAdmin(userData) && (
            <>
              {!summaries && !isLoadingAdminGraph ? (
                <Box display='flex' justifyContent='center'>
                  <Button disabled={isLoadingAdminGraph} onClick={() => fetchSummaries()}>
                    Tutorienübersicht laden
                  </Button>
                </Box>
              ) : (
                <Placeholder
                  placeholderText={'Keine Daten für Tutorienübersicht verfügbar.'}
                  showPlaceholder={!!summaries && Object.entries(summaries).length === 0}
                  loading={isLoadingAdminGraph}
                  SpinnerProps={{
                    shrinkBox: true,
                    text: 'Lade Tutorienübersicht',
                  }}
                >
                  {!!summaries && Object.entries(summaries).length > 0 && (
                    <div>
                      <AdminStatsCard studentsByTutorialSummary={summaries} />
                    </div>
                  )}
                </Placeholder>
              )}

              <Divider style={{ margin: '16px 0px' }} />
            </>
          )}

          <AllTutorialStatistics
            items={tutorialsWithScheinCriteriaSummaries ?? []}
            createRowFromItem={(item) => <TutorialStatistics value={item} />}
            placeholder='Keine Tutorien vorhanden'
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
