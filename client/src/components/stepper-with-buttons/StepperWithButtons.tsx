import { Box } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import StepperContent from './components/StepperContent';
import StepperHeader, { StepperHeaderProps } from './components/StepperHeader';
import { NextStepCallback, StepData, StepperContext } from './context/StepperContext';

export interface StepInformation {
  label: string;
  component: React.FunctionComponent;
  skippable?: boolean;
}

export interface StepperWithButtonsProps extends StepperHeaderProps {
  steps: StepInformation[];
}

interface State {
  callback: NextStepCallback | undefined;
}

function StepperWithButtons({
  steps: stepsFromProps,
  ...props
}: StepperWithButtonsProps): JSX.Element {
  const [activeStep, setInternalActiveStep] = useState(0);
  const [state, setState] = useState<State>({ callback: undefined });
  const [isWaitingOnNextCallback, setWaitingOnNextCallback] = useState(false);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [isNextDisabled, setNextDisabled] = useState(false);

  useEffect(() => {
    setSteps([...stepsFromProps]);
  }, [stepsFromProps]);

  const setActiveStep = useCallback(
    (nextStep: number) => {
      if (nextStep >= steps.length || nextStep < 0) {
        return;
      }

      setInternalActiveStep(nextStep);
      setNextDisabled(false);
    },
    [steps.length]
  );

  const nextStep = useCallback(
    async (skipCallback?: boolean) => {
      if (isWaitingOnNextCallback) {
        return;
      }

      if (skipCallback) {
        return setActiveStep(activeStep + 1);
      }

      const { callback } = state;

      if (!callback) {
        return setActiveStep(activeStep + 1);
      }

      setWaitingOnNextCallback(true);
      const { goToNext, error, runAfterFinished } = await callback();

      setSteps(
        steps.map((step, index) => {
          if (index !== activeStep) {
            return step;
          }

          return {
            ...step,
            error,
          };
        })
      );
      setWaitingOnNextCallback(false);

      if (goToNext) {
        setActiveStep(activeStep + 1);
      }

      if (!error && runAfterFinished) {
        runAfterFinished();
      }
    },
    [activeStep, isWaitingOnNextCallback, setWaitingOnNextCallback, state, steps, setActiveStep]
  );

  const prevStep = useCallback(async () => {
    setActiveStep(activeStep - 1);
  }, [activeStep, setActiveStep]);

  const setNextCallback = useCallback((cb: NextStepCallback) => {
    setState({ callback: cb });
  }, []);

  const removeNextCallback = useCallback(() => {
    setState({ callback: undefined });
  }, []);

  const getNextCallback = useCallback(() => {
    return state.callback;
  }, [state.callback]);

  return (
    <StepperContext.Provider
      value={{
        activeStep,
        nextStep,
        prevStep,
        steps,
        setNextCallback,
        getNextCallback,
        removeNextCallback,
        isWaitingOnNextCallback,
        setWaitingOnNextCallback,
        isNextDisabled,
        setNextDisabled,
      }}
    >
      <Box className={props.className} display='flex' flexDirection='column'>
        <StepperHeader {...props} />

        <StepperContent flex={1} display='flex' paddingLeft={2} paddingRight={2} overflow='auto' />
      </Box>
    </StepperContext.Provider>
  );
}

export default StepperWithButtons;
