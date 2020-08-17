import React, { useCallback, useEffect } from 'react';
import ImportCSV from '../../../components/import-csv/ImportCSV';
import { useImportCSVHelpers } from '../../../components/import-csv/ImportCSV.context';
import {
  NextStepCallback,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';

function ImportUserCSV(): JSX.Element {
  const { setNextCallback, removeNextCallback, setNextDisabled, nextStep } = useStepper();
  const { handleCSVFormSubmit, canSubmitCSV } = useImportCSVHelpers();

  useKeyboardShortcut([{ key: 'Enter', modifiers: { ctrlKey: true } }], (e) => {
    e.preventDefault();
    e.stopPropagation();

    nextStep();
  });

  const handleSubmit: NextStepCallback = useCallback(async () => {
    const { isSuccess } = await handleCSVFormSubmit();

    return isSuccess ? { goToNext: true } : { goToNext: false, error: true };
  }, [handleCSVFormSubmit]);

  useEffect(() => {
    setNextDisabled(!canSubmitCSV);
  }, [canSubmitCSV, setNextDisabled]);

  useEffect(() => {
    setNextCallback(handleSubmit);

    return removeNextCallback;
  }, [setNextCallback, removeNextCallback, handleSubmit]);

  return <ImportCSV />;
}

export default ImportUserCSV;
