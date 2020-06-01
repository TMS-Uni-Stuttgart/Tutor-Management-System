import { FormikHelpers } from 'formik';
import pwGenerator from 'generate-password';
import {
  Eye as RemoveRedEyeOutlinedIcon,
  Restore as RestoreOutlinedIcon,
  Shuffle as ShuffleIcon,
} from 'mdi-material-ui';
import React, { useState } from 'react';
import { Role } from 'shared/model/Role';
import * as Yup from 'yup';
import { IUser } from '../../../../server/src/shared/model/User';
import { Tutorial } from '../../model/Tutorial';
import { FormikSubmitCallback } from '../../types';
import { passwordValidationSchema } from '../../util/validationSchemas';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import { FormikTextFieldWithButtons } from './components/FormikTextFieldWithButtons';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

export type UserFormSubmitCallback = FormikSubmitCallback<UserFormState>;

export interface UserFormState {
  firstname: string;
  lastname: string;
  roles: Role[];
  tutorials: string[];
  tutorialsToCorrect: string[];
  email: string;
  username: string;
  password: string;
}

interface Props extends Omit<FormikBaseFormProps<UserFormState>, CommonlyUsedFormProps> {
  user?: IUser;
  availableRoles: Role[];
  tutorials: Tutorial[];
  onSubmit: UserFormSubmitCallback;
}

function generateTemporaryPassword(): string {
  return pwGenerator.generate({
    length: 16,
    numbers: true,
    excludeSimilarCharacters: true,
    strict: true,
  });
}

function getInitialFormState(user?: IUser): UserFormState {
  if (!user) {
    return {
      firstname: '',
      lastname: '',
      roles: [Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
      username: '',
      email: '',
      password: generateTemporaryPassword(),
    };
  }

  return {
    firstname: user.firstname,
    lastname: user.lastname,
    roles: user.roles,
    tutorials: user.tutorials.map((t) => t.id),
    tutorialsToCorrect: user.tutorialsToCorrect.map((t) => t.id),
    username: user.username,
    email: user.email,
    password: '',
  };
}

function getValidationSchema(
  availableRoles: Role[],
  isEditMode: boolean
): Yup.ObjectSchema<Yup.Shape<Partial<UserFormState>, Partial<UserFormState>>> {
  let validationShape: {
    [K in keyof UserFormState]?: Yup.Schema<any>;
  } = {
    firstname: Yup.string().required('Benötigt'),
    lastname: Yup.string().required('Benötigt'),
    email: Yup.string().email('Keine gültige E-Mailadresse').required('Benötigt'),
    roles: Yup.array()
      .of(Yup.string().oneOf(availableRoles))
      .min(1, 'Mind. eine Rolle muss zugewiesen sein.'),
    username: Yup.string().required('Benötigt'),
    password: passwordValidationSchema,
  };

  if (isEditMode) {
    validationShape = {
      ...validationShape,
      password: passwordValidationSchema.notRequired(),
    };
  }

  return Yup.object().shape(validationShape).defined();
}

function UserForm({
  availableRoles,
  onSubmit,
  user,
  tutorials,
  className,
  ...other
}: Props): JSX.Element {
  const [hidePassword, setHidePassword] = useState(true);

  const isEditMode = user !== undefined;
  const ValidationSchema = getValidationSchema(availableRoles, isEditMode);
  const initialFormState: UserFormState = getInitialFormState(user);

  function generateUsername(
    { firstname, lastname }: { firstname: string; lastname: string },
    setFieldValue: FormikHelpers<UserFormState>['setFieldValue']
  ) {
    const charsFromLastname: string = lastname.substr(0, 6);
    const charsFromFirstname: string = firstname.charAt(0) + firstname.charAt(firstname.length - 1);
    const username: string = (charsFromLastname + charsFromFirstname).toLowerCase();

    setFieldValue('username', username);
  }

  return (
    <FormikBaseForm
      {...other}
      initialValues={initialFormState}
      validationSchema={ValidationSchema}
      onSubmit={onSubmit}
      enableDebug
      enableErrorsInDebug
    >
      {({ setFieldValue, values }) => (
        <>
          <FormikTextField
            name='firstname'
            label='Vorname'
            required
            autoFocus
            onChangeCapture={(e: any) =>
              generateUsername(
                { firstname: (e.target as HTMLInputElement).value, lastname: values.lastname },
                setFieldValue
              )
            }
          />

          <FormikTextField
            name='lastname'
            label='Nachname'
            required
            onChangeCapture={(e: any) =>
              generateUsername(
                { firstname: values.firstname, lastname: (e.target as HTMLInputElement).value },
                setFieldValue
              )
            }
          />

          <FormikTextField name='email' label='E-Mailadresse' required />

          <FormikSelect
            name='roles'
            label='Rolle'
            required
            emptyPlaceholder='Keine Rollen vorhanden.'
            onChange={(e: any) => {
              const roles: string[] = e.target.value;

              if (!roles.includes(Role.TUTOR)) {
                setFieldValue('tutorials', []);
              }

              if (!roles.includes(Role.CORRECTOR)) {
                setFieldValue('tutorialsToCorrect', []);
              }
            }}
            items={availableRoles}
            itemToString={(role) => Role[role].toString()}
            itemToValue={(role) => role}
            multiple
            isItemSelected={(role) => values['roles'].indexOf(role) > -1}
          />

          <FormikTextFieldWithButtons
            name='username'
            label='Benutzername'
            required
            buttons={[
              {
                key: 'generateUsername',
                Icon: RestoreOutlinedIcon,
                onClick: () =>
                  generateUsername(
                    { firstname: values.firstname, lastname: values.lastname },
                    setFieldValue
                  ),
              },
            ]}
          />

          <FormikTextFieldWithButtons
            name='password'
            label={isEditMode ? 'Neues Passwort' : 'Erstes Passwort'}
            type={hidePassword ? 'password' : 'text'}
            required={!isEditMode}
            buttons={[
              {
                key: 'hidePassword',
                Icon: RemoveRedEyeOutlinedIcon,
                color: hidePassword ? 'default' : 'secondary',
                onClick: () => setHidePassword(!hidePassword),
              },
              {
                key: 'generatePassword',
                Icon: ShuffleIcon,
                onClick: () => setFieldValue('password', generateTemporaryPassword()),
              },
            ]}
          />

          <FormikSelect
            name='tutorials'
            label='Tutorien'
            helperText='Tutorien, die gehalten werden.'
            emptyPlaceholder='Keine Tutorien vorhanden.'
            items={tutorials}
            itemToString={(tutorial) => `Slot ${tutorial.slot}`}
            itemToValue={(tutorial) => tutorial.id}
            multiple
            isItemSelected={(tutorial) => values['tutorials'].indexOf(tutorial.id) > -1}
            disabled={!values['roles'] || values['roles'].indexOf(Role.TUTOR) === -1}
          />

          <FormikSelect
            name='tutorialsToCorrect'
            label='Korrigierte Tutorien'
            helperText='Tutorien, die korrigiert werden.'
            emptyPlaceholder='Keine Tutorien vorhanden.'
            items={tutorials}
            itemToString={(tutorial) => `Slot ${tutorial.slot}`}
            itemToValue={(tutorial) => tutorial.id}
            multiple
            isItemSelected={(tutorial) => values['tutorialsToCorrect'].indexOf(tutorial.id) > -1}
            disabled={!values['roles'] || values['roles'].indexOf(Role.CORRECTOR) === -1}
          />
        </>
      )}
    </FormikBaseForm>
  );
}

export default UserForm;
