import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Paper,
  Step,
  StepLabel,
  Stepper,
  StepperProps,
} from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import BackButton from '../../back-button/BackButton';
import SubmitButton from '../../loading/SubmitButton';
import { useStepper } from '../context/StepperContext';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    buttonBox: {
      margin: theme.spacing(0, 2),
    },
    skipButton: {
      marginRight: theme.spacing(1),
    },
    stepper: {
      flex: 1,
      padding: theme.spacing(3, 1),
    },
  })
);

export interface StepperHeaderProps extends Omit<StepperProps, 'children' | 'activeStep'> {
  backButtonLabel: string;
  backButtonRoute?: string;
  nextButtonLabel: string;
  nextButtonDoneLabel?: string;
}

export interface StepperBackButtonProps {
  backButtonLabel: string;
  backButtonRoute?: string;
}

function StepperBackButton({
  backButtonLabel,
  backButtonRoute,
}: StepperBackButtonProps): JSX.Element {
  const { activeStep, prevStep } = useStepper();

  if (!!backButtonRoute && activeStep === 0) {
    return <BackButton to={backButtonRoute} />;
  }

  return (
    <Button variant='outlined' onClick={prevStep} disabled={activeStep <= 0}>
      {backButtonLabel}
    </Button>
  );
}

function StepperHeader({
  backButtonLabel,
  nextButtonLabel,
  nextButtonDoneLabel,
  backButtonRoute,
  className,
  ...props
}: StepperHeaderProps): JSX.Element {
  const classes = useStyles();
  const { activeStep, nextStep, isWaitingOnNextCallback, steps, isNextDisabled } = useStepper();

  return (
    <Paper className={clsx(classes.paper)}>
      <Box className={classes.buttonBox}>
        <StepperBackButton backButtonLabel={backButtonLabel} backButtonRoute={backButtonRoute} />
      </Box>

      <Stepper className={classes.stepper} {...props} activeStep={activeStep}>
        {steps.map((data, index) => {
          return (
            <Step key={data.label} completed={activeStep !== undefined && index < activeStep}>
              <StepLabel error={data.error}>{data.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box className={classes.buttonBox}>
        {steps[activeStep]?.skippable && (
          <Button variant='outlined' className={classes.skipButton} onClick={() => nextStep(true)}>
            Überspringen
          </Button>
        )}

        <SubmitButton
          isSubmitting={isWaitingOnNextCallback}
          variant='contained'
          color='primary'
          onClick={() => nextStep()}
          disabled={isNextDisabled || activeStep === steps.length}
        >
          {!!nextButtonDoneLabel
            ? activeStep < steps.length - 1
              ? nextButtonLabel
              : nextButtonDoneLabel
            : nextButtonLabel}
        </SubmitButton>
      </Box>
    </Paper>
  );
}

export default StepperHeader;
