import React, { useEffect } from 'react';
import {
  useStepper,
  NextStepInformation,
} from '../../../components/stepper-with-buttons/context/StepperContext';

function GenerateTutorials(): JSX.Element {
  const { setNextCallback, removeNextCallback } = useStepper();

  useEffect(() => {
    console.log('GenerateTutorials - registering next callback');
    const callback = async () => {
      console.log('Next clicked');
      return new Promise<NextStepInformation>((resolve) => {
        setTimeout(() => resolve({ goToNext: true }), 2000);
      });
    };

    setNextCallback(callback);

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback]);

  return <div>Generate Tutorials</div>;
}

export default GenerateTutorials;
