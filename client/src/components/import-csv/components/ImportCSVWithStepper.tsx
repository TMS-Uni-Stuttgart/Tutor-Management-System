import React, { useCallback, useEffect } from 'react';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';
import { NextStepCallback, useStepper } from '../../stepper-with-buttons/context/StepperContext';
import { useImportCSVHelpers } from '../hooks/useImportCSVHelpers';
import ImportCSV from './ImportCSV';

function ImportCSVWithStepper(): JSX.Element {
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

export default ImportCSVWithStepper;
