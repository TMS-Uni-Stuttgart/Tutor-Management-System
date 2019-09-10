import React, { useEffect, useState } from 'react';
import { Role } from 'shared/dist/model/Role';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { LoggedInUser } from 'shared/dist/model/User';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getTutorial } from '../../hooks/fetching/Tutorial';
import { useAxios } from '../../hooks/FetchingService';
import { useLogin } from '../../hooks/LoginService';
import {
  StudentByTutorialSlotSummaryMap,
  StudentScheinCriteriaSummaryMap,
} from '../../typings/types';
import AdminStatsCard from './components/AdminStatsCard';
import AllTutorialStatistics from './components/AllTutorialStatistics';
import TutorialStatistics from './components/TutorialStatistics';

export interface TutorialSummaryInfo {
  tutorial: Tutorial;
  studentInfos: StudentScheinCriteriaSummaryMap;
}

function isAdmin(userData: LoggedInUser | undefined): boolean {
  return !!userData && userData.roles.includes(Role.ADMIN);
}

function Dashboard(): JSX.Element {
  const { userData } = useLogin();
  const {
    getScheinCriteriaSummariesOfAllStudentsOfTutorial,
    getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots,
  } = useAxios();

  const [isLoading, setIsLoading] = useState(false);
  const [tutorialsWithScheinCriteriaSummaries, setTutorialsWithScheinCriteriaSummaries] = useState<
    TutorialSummaryInfo[]
  >([]);

  const [summaries, setSummaries] = useState<StudentByTutorialSlotSummaryMap>({});

  useEffect(() => {}, [getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots]);

  useEffect(() => {
    setIsLoading(true);

    (async function() {
      if (!userData) {
        return;
      }

      if (isAdmin(userData)) {
        const response = await getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots();

        setSummaries(response);
      }

      const sortedTutorials = userData.tutorials.sort((a, b) => a.slot - b.slot);

      for (const loggedInTutorial of sortedTutorials) {
        const tutorial = await getTutorial(loggedInTutorial.id);
        const studentInfos = await getScheinCriteriaSummariesOfAllStudentsOfTutorial(
          loggedInTutorial.id
        );

        setTutorialsWithScheinCriteriaSummaries(prevState => [
          ...prevState,
          { tutorial, studentInfos },
        ]);
      }

      setIsLoading(false);
    })();
  }, [
    getScheinCriteriaSummariesOfAllStudentsOfTutorial,
    getScheinCriteriaSummaryOfAllStudentsWithTutorialSlots,
    userData,
  ]);

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {isAdmin(userData) && Object.entries(summaries).length > 0 && (
            <div>
              <AdminStatsCard studentsByTutorialSummary={summaries} />
            </div>
          )}

          <AllTutorialStatistics
            items={tutorialsWithScheinCriteriaSummaries}
            createRowFromItem={item => <TutorialStatistics value={item} />}
            placeholder='Keine Tutorien vorhanden'
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
