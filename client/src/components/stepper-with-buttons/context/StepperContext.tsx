import React, { useContext, useEffect } from 'react';
import { throwContextNotInitialized } from '../../../util/throwFunctions';

export interface NextStepInformation {
  goToNext: boolean;
  error?: boolean;
}

export type NextStepCallback = () => Promise<NextStepInformation>;

export interface StepData {
  label: string;
  component: React.ReactChild;
  error?: boolean;
  skippable?: boolean;
}

interface StepperContextValue {
  activeStep: number;
  isWaitingOnNextCallback: boolean;
  isNextDisabled: boolean;
  steps: StepData[];
  nextStep: (skipCallback?: boolean) => Promise<void>;
  prevStep: () => Promise<void>;
  setWaitingOnNextCallback: (waiting: boolean) => void;
  setNextCallback: (cb: NextStepCallback) => void;
  setNextDisabled: (isDisabled: boolean) => void;
  removeNextCallback: () => void;
  getNextCallback: () => NextStepCallback | undefined;
}

export const StepperContext = React.createContext<StepperContextValue>({
  activeStep: -1,
  isWaitingOnNextCallback: false,
  isNextDisabled: false,
  steps: [],
  setWaitingOnNextCallback: throwContextNotInitialized('StepperContext'),
  prevStep: throwContextNotInitialized('StepperContext'),
  nextStep: throwContextNotInitialized('StepperContext'),
  setNextDisabled: throwContextNotInitialized('StepperContext'),
  setNextCallback: throwContextNotInitialized('StepperContext'),
  removeNextCallback: throwContextNotInitialized('StepperContext'),
  getNextCallback: throwContextNotInitialized('StepperContext'),
});

/**
 * Use the stepper context.
 *
 * If a callback is provided as an argument it gets set as the one called by the "Next" button. This hook also removes the callback on cleanup.
 *
 * @param cb Callback used for the next button if provided.
 */
export function useStepper(cb?: NextStepCallback): Omit<StepperContextValue, 'getNextCallback'> {
  const { getNextCallback, setNextCallback, removeNextCallback, ...context } = useContext(
    StepperContext
  );

  useEffect(() => {
    if (cb) {
      setNextCallback(cb);
    }

    return removeNextCallback;
  }, [cb, setNextCallback, removeNextCallback]);

  return { ...context, setNextCallback, removeNextCallback };
}
