import { Box } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import StepperContent from './components/StepperContent';
import StepperHeader, { StepperHeaderProps } from './components/StepperHeader';
import { NextStepCallback, StepData, StepperContext } from './context/StepperContext';

export interface StepInformation {
  label: string;
  component: React.FunctionComponent;
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
  const [activeStep, setActiveStep] = useState(0);
  const [state, setState] = useState<State>({ callback: undefined });
  const [isWaitingOnNextCallback, setWaitingOnNextCallback] = useState(false);
  const [steps, setSteps] = useState<StepData[]>([]);

  useEffect(() => {
    setSteps([...stepsFromProps]);
  }, [stepsFromProps]);

  async function nextStep() {
    if (isWaitingOnNextCallback) {
      return;
    }

    const { callback } = state;

    if (!callback) {
      return setActiveStep(activeStep + 1);
    }

    setWaitingOnNextCallback(true);
    const { goToNext, error } = await callback();

    if (error !== undefined) {
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
    }

    if (goToNext) {
      setActiveStep(activeStep + 1);
    }

    setWaitingOnNextCallback(false);
  }

  async function prevStep() {
    setActiveStep(activeStep - 1);
  }

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
      }}
    >
      <Box className={props.className}>
        <StepperHeader {...props} />

        <StepperContent />
      </Box>
    </StepperContext.Provider>
  );
}

export default StepperWithButtons;
