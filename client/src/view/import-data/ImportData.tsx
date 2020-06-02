import { Box, Button } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      margin: theme.spacing(0, 2),
    },
    stepper: {
      flex: 1,
      padding: theme.spacing(3, 1),
    },
  })
);

function ImportData(): JSX.Element {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Tutorien generieren', 'Nutzer importieren', 'Abschließen'];

  return (
    <Box>
      <StepperWithButtons
        steps={steps}
        activeStep={activeStep}
        alternativeLabel
        backButton={
          <Button
            variant='outlined'
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 0}
          >
            Zurück
          </Button>
        }
        nextButton={
          <Button variant='outlined' onClick={() => setActiveStep(activeStep + 1)}>
            {activeStep < steps.length - 1 ? 'Weiter' : 'Fertigstellen'}
          </Button>
        }
      />
    </Box>
  );
}

export default ImportData;
