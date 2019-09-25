import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  RemoveRedEyeOutlined as RemoveRedEyeOutlinedIcon,
  RestoreOutlined as RestoreOutlinedIcon,
  Shuffle as ShuffleIcon,
} from '@material-ui/icons';
import { FormikHelpers } from 'formik';
import pwGenerator from 'generate-password';
import React, { useState } from 'react';
import { Role } from 'shared/dist/model/Role';
import { Tutorial } from 'shared/dist/model/Tutorial';
import * as Yup from 'yup';
import { FormikSubmitCallback } from '../../types';
import { UserWithFetchedTutorials } from '../../typings/types';
import { passwordValidationSchema } from '../../util/validationSchemas';
import FormikSelect from './components/FormikSelect';
import FormikTextField from './components/FormikTextField';
import { FormikTextFieldWithButtons } from './components/FormikTextFieldWithButtons';
import FormikBaseForm, { CommonlyUsedFormProps, FormikBaseFormProps } from './FormikBaseForm';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridColumnGap: theme.spacing(1),
      gridRowGap: theme.spacing(2),
    },
    tutorialDropdown: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    chipContainer: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textFieldButton: {
      minWidth: 0,
      height: 32,
      width: 32,
      marginLeft: theme.spacing(0.75),
    },
    twoColumns: {
      gridColumn: '1 / span 2',
    },
    buttonRow: {
      gridColumn: '1 / span 2',
      display: 'flex',
      justifyContent: 'flex-end',
    },
  })
);

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
  user?: UserWithFetchedTutorials;
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

function getInitialFormState(user?: UserWithFetchedTutorials): UserFormState {
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
    tutorials: user.tutorials.map(t => t.id),
    tutorialsToCorrect: [...user.tutorialsToCorrect],
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
    email: Yup.string()
      .email('Keine gültige E-Mailadresse')
      .required('Benötigt'),
    roles: Yup.array()
      .of(Yup.string().oneOf(availableRoles))
      .min(1, 'Mind. eine Rolle muss zugewiesen sein.'),
    password: passwordValidationSchema,
    tutorialsToCorrect: Yup.array<string>().test({
      test: function(this, value: unknown) {
        const roles = this.resolve(Yup.ref('roles'));

        if (!Array.isArray(roles)) {
          // If roles is not an array consider this field as always valid.
          return true;
        }

        if (roles.indexOf(Role.CORRECTOR) === -1) {
          // If the edited user is NOT a corrector no special rules apply for this field.
          return true;
        }

        if (!Array.isArray(value) || value.length === 0) {
          return new Yup.ValidationError(
            'Korrigierende brauchen mind. 1 Tutorial.',
            value,
            'tutorialsToCorrect'
          );
        }

        return true;
      },
    }),
  };

  if (!isEditMode) {
    validationShape = {
      ...validationShape,
      username: Yup.string().required('Benötigt'),
    };
  } else {
    validationShape = {
      ...validationShape,
      password: passwordValidationSchema.notRequired(),
    };
  }

  return Yup.object().shape(validationShape);
}

function UserForm({
  availableRoles,
  onSubmit,
  user,
  tutorials,
  className,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();
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
            itemToString={role => Role[role].toString()}
            itemToValue={role => role}
            multiple
            isItemSelected={role => values['roles'].indexOf(role) > -1}
          />

          <FormikTextFieldWithButtons
            name='username'
            label='Benutzername'
            required
            disabled={isEditMode}
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
            itemToString={tutorial => `Slot ${tutorial.slot}`}
            itemToValue={tutorial => tutorial.id}
            multiple
            isItemSelected={tutorial => values['tutorials'].indexOf(tutorial.id) > -1}
            disabled={!values['roles'] || values['roles'].indexOf(Role.TUTOR) === -1}
          />

          <FormikSelect
            name='tutorialsToCorrect'
            label='Korrigierte Tutorien'
            helperText='Tutorien, die korrigiert werden.'
            emptyPlaceholder='Keine Tutorien vorhanden.'
            items={tutorials}
            itemToString={tutorial => `Slot ${tutorial.slot}`}
            itemToValue={tutorial => tutorial.id}
            multiple
            isItemSelected={tutorial => values['tutorialsToCorrect'].indexOf(tutorial.id) > -1}
            disabled={!values['roles'] || values['roles'].indexOf(Role.CORRECTOR) === -1}
          />
        </>
      )}
    </FormikBaseForm>
  );
}

export default UserForm;
