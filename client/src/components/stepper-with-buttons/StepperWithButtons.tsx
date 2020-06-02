import { Box, Paper, Step, StepLabel, Stepper, StepperProps } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

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

interface Props extends Omit<StepperProps, 'children'> {
  backButton: React.ReactNode;
  nextButton: React.ReactNode;
  steps: string[];
  activeStep?: number;
}

function StepperWithButtons({
  steps,
  backButton,
  nextButton,
  className,
  activeStep,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Paper className={clsx(classes.paper, className)}>
      <Box className={classes.button}>{backButton}</Box>

      <Stepper className={classes.stepper} {...props} activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep !== undefined && index < activeStep}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box className={classes.button}>{nextButton}</Box>
    </Paper>
  );
}

export default StepperWithButtons;
