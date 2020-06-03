import { Box } from '@material-ui/core';
import React from 'react';
import { useStepper } from '../context/StepperContext';

function StepperContent() {
  const { activeStep, steps } = useStepper();
  const StepElement =
    steps[activeStep]?.component ?? (() => <div>NO ELEMENT FOUND FOR STEP {activeStep}</div>);

  return (
    <Box marginTop={2}>
      <StepElement />
    </Box>
  );
}

export default StepperContent;
