import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { useStepper } from './context/StepperContext';

function HookUpStepperWithFormik(): null {
  const history = useHistory();
  const { submitForm } = useFormikContext<unknown>();

  const { setNextCallback, removeNextCallback } = useStepper();

  useEffect(() => {
    setNextCallback(async () => {
      const isSuccess: any = await submitForm();

      if (!!isSuccess) {
        return { goToNext: true };
      } else {
        return { goToNext: false, error: true };
      }
    });

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, submitForm, history]);

  return null;
}

export default HookUpStepperWithFormik;
