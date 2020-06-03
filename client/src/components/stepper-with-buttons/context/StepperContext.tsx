import React, { useContext } from 'react';

export interface NextStepInformation {
  goToNext: boolean;
  error?: boolean;
}

export type NextStepCallback = () => Promise<NextStepInformation>;

export interface StepData {
  label: string;
  component: React.FunctionComponent;
  error?: boolean;
}

interface StepperContextValue {
  activeStep: number;
  isWaitingOnNextCallback: boolean;
  steps: StepData[];
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  setWaitingOnNextCallback: (waiting: boolean) => void;
  setNextCallback: (cb: NextStepCallback) => void;
  removeNextCallback: () => void;
  getNextCallback: () => NextStepCallback | undefined;
}

function notInitialised(): any {
  throw new Error('StepperContext is NOT initialized.');
}

export const StepperContext = React.createContext<StepperContextValue>({
  activeStep: -1,
  isWaitingOnNextCallback: false,
  steps: [],
  setWaitingOnNextCallback: notInitialised,
  prevStep: notInitialised,
  nextStep: notInitialised,
  setNextCallback: notInitialised,
  removeNextCallback: notInitialised,
  getNextCallback: notInitialised,
});

export function useStepper(): Omit<StepperContextValue, 'getNextCallback'> {
  const { getNextCallback, ...context } = useContext(StepperContext);

  return { ...context };
}
