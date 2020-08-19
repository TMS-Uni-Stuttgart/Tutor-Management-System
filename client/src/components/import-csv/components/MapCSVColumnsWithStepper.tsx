import React, { useEffect } from 'react';
import { useStepper } from '../../stepper-with-buttons/context/StepperContext';
import { useMapColumnsHelpers } from '../hooks/useMapColumnsHelpers';
import MapCSVColumns from './MapCSVColumns';

function MapCSVColumnsWithStepper(): JSX.Element {
  const { handleMappedColumnsSubmit, isValidFormState } = useMapColumnsHelpers();
  const { setNextDisabled, setNextCallback } = useStepper();

  useEffect(() => {
    setNextCallback(async () => {
      const { isSuccess } = await handleMappedColumnsSubmit();

      return isSuccess ? { goToNext: true } : { goToNext: false, error: true };
    });
  }, [handleMappedColumnsSubmit, setNextCallback]);

  useEffect(() => {
    setNextDisabled(!isValidFormState);
  }, [isValidFormState, setNextDisabled]);

  return <MapCSVColumns />;
}

export default MapCSVColumnsWithStepper;
