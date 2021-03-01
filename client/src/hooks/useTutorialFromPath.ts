import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Tutorial } from '../model/Tutorial';
import { getTutorial } from './fetching/Tutorial';

interface TutorialFromPath {
  tutorial: Tutorial | undefined;
  isLoading: boolean;
  error?: string;
}

export function useTutorialFromPath(): TutorialFromPath {
  const { tutorialId } = useParams<{ tutorialId?: string }>();
  const [tutorial, setTutorial] = useState<Tutorial>();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!tutorialId) {
      setError('Keine ID für das Tutorium über die URL vorhanden.');
      return;
    }

    setLoading(true);
    getTutorial(tutorialId)
      .then((tutorial) => setTutorial(tutorial))
      .catch(() => setError('Tutorium konnte nicht abgerufen werden.'))
      .finally(() => setLoading(false));
  }, [tutorialId]);

  return { tutorial, isLoading, error };
}
