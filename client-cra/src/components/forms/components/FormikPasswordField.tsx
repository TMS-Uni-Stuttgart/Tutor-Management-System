import { Eye as RemoveRedEyeOutlinedIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import {
  FormikTextFieldWithButtons,
  FormikTextFieldWithButtonsProps,
} from './FormikTextFieldWithButtons';

type PropTypes = Omit<FormikTextFieldWithButtonsProps, 'type' | 'buttons'> & {
  buttons?: FormikTextFieldWithButtonsProps['buttons'];
};

function FormikPasswordField({ buttons, ...props }: PropTypes): JSX.Element {
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <FormikTextFieldWithButtons
      type={hidePassword ? 'password' : 'text'}
      {...props}
      buttons={[
        {
          key: 'hidePassword',
          Icon: RemoveRedEyeOutlinedIcon,
          color: hidePassword ? 'default' : 'secondary',
          onClick: () => setHidePassword(!hidePassword),
        },
        ...(buttons ?? []),
      ]}
    />
  );
}

export default FormikPasswordField;
