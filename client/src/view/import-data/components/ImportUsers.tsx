import React, { useEffect, useState } from 'react';
import {
  useStepper,
  NextStepInformation,
} from '../../../components/stepper-with-buttons/context/StepperContext';

function ImportUsers(): JSX.Element {
  const { setNextCallback, removeNextCallback } = useStepper();
  const [timesTried, setTimesTried] = useState(0);

  useEffect(() => {
    console.log('ImportUsers - registering next callback');
    const callback = () => {
      console.log('Other next clicked');
      return new Promise<NextStepInformation>((resolve) => {
        setTimeout(() => {
          if (timesTried === 0) {
            setTimesTried(1);
            resolve({ goToNext: false, error: true });
          } else {
            setTimesTried(0);
            resolve({ goToNext: true, error: false });
          }
        }, 2000);
      });
    };

    setNextCallback(callback);

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, timesTried]);

  return <div>IMPORT USERS</div>;
}

export default ImportUsers;
