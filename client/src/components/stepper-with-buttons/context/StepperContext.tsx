import React, { useContext } from 'react';
import { throwContextNotInitialized } from '../../../util/throwFunctions';

export interface NextStepInformation {
  goToNext: boolean;
  error?: boolean;
  runAfterFinished?: () => void;
}

export type NextStepCallback = () => Promise<NextStepInformation>;

export interface StepData {
  label: string;
  component: React.FunctionComponent;
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

export function useStepper(): Omit<StepperContextValue, 'getNextCallback'> {
  const { getNextCallback, ...context } = useContext(StepperContext);

  return { ...context };
}
