import { Box } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { CustomRoute } from '../../routes/Routing.types';
import { RouteParams } from '../../routes/typesafe-react-router';
import { RouteParamBaseArray } from '../../routes/typesafe-react-router/types';
import StepperContent from './components/StepperContent';
import StepperHeader, { StepperHeaderProps } from './components/StepperHeader';
import { NextStepCallback, StepData, StepperContext } from './context/StepperContext';

export interface StepInformation {
  label: string;
  component: React.ReactChild;
  skippable?: boolean;
}

interface Route<Parts extends RouteParamBaseArray> {
  route: CustomRoute<Parts>;
  params: RouteParams<Parts>;
}

export interface StepperWithButtonsProps<Parts extends RouteParamBaseArray>
  extends StepperHeaderProps {
  steps: StepInformation[];
  routeAfterLastStep: Route<Parts>;
}

interface State {
  callback: NextStepCallback | undefined;
}

function StepperWithButtons<Parts extends RouteParamBaseArray>({
  steps: stepsFromProps,
  routeAfterLastStep,
  ...props
}: StepperWithButtonsProps<Parts>): JSX.Element {
  const history = useHistory();
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
      if (nextStep < 0) {
        return;
      } else if (nextStep >= steps.length) {
        const { route, params } = routeAfterLastStep;
        history.push(route.create(params));
        return;
      }

      setInternalActiveStep(nextStep);
      setNextDisabled(false);
    },
    [steps.length, history, routeAfterLastStep]
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
      const { goToNext, error } = await callback();

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
