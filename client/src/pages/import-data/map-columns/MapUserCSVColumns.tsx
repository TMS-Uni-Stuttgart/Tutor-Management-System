import React, { useEffect } from 'react';
import { useMapColumnsHelpers } from '../../../components/import-csv/ImportCSV.context';
import MapCSVColumns from '../../../components/import-csv/MapCSVColumns';
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
