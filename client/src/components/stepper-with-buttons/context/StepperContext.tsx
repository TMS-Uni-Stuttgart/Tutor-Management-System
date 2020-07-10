import React, { useContext } from 'react';
import { notInitializied } from '../../../util/throwFunctions';

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
  setWaitingOnNextCallback: notInitializied('StepperContext'),
  prevStep: notInitializied('StepperContext'),
  nextStep: notInitializied('StepperContext'),
  setNextDisabled: notInitializied('StepperContext'),
  setNextCallback: notInitializied('StepperContext'),
  removeNextCallback: notInitializied('StepperContext'),
  getNextCallback: notInitializied('StepperContext'),
});

export function useStepper(): Omit<StepperContextValue, 'getNextCallback'> {
  const { getNextCallback, ...context } = useContext(StepperContext);

  return { ...context };
}
