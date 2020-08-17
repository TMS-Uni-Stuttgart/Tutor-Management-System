import React, { useEffect } from 'react';
import MapCSVColumns from '../../../components/import-csv/components/MapCSVColumns';
import { useMapColumnsHelpers } from '../../../components/import-csv/hooks/useMapColumnsHelpers';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';

function MapUserCSVColumns(): JSX.Element {
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

export default MapUserCSVColumns;
