import { Box, BoxProps } from '@material-ui/core';
import React from 'react';
import { useStepper } from '../context/StepperContext';

function StepperContent(props: BoxProps): JSX.Element {
  const { activeStep, steps } = useStepper();
  const StepElement: React.ReactChild =
    steps[activeStep]?.component ?? (() => <div>NO ELEMENT FOUND FOR STEP {activeStep}</div>);

  return (
    <Box marginTop={2} {...props}>
      {StepElement}
    </Box>
  );
}

export default StepperContent;
