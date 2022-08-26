import { Button } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  EmailSendOutline as SendIcon,
  Printer as PrintIcon,
  TableArrowDown as ImportIcon,
} from 'mdi-material-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FailedMail, MailingStatus } from 'shared/model/Mail';
import { Role } from 'shared/model/Role';
import { ICreateUserDTO, IUser, IUserDTO } from 'shared/model/User';
import { getNameOfEntity } from 'shared/util/helpers';
import UserForm, { UserFormState, UserFormSubmitCallback } from '../../components/forms/UserForm';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import SubmitButton from '../../components/loading/SubmitButton';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/dialog-service/DialogService';
import { getCredentialsPDF } from '../../hooks/fetching/Files';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';
import {
  createUser,
  deleteUser,
  editUser,
  getUsers,
  sendCredentials as sendCredentialsRequest,
  sendCredentialsToSingleUser as sendCredentialsToSingleUserRequest,
  setTemporaryPassword,
} from '../../hooks/fetching/User';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../hooks/useFetchState';
import { useSettings } from '../../hooks/useSettings';
import { ROUTES } from '../../routes/Routing.routes';
import { saveBlob } from '../../util/helperFunctions';
import UserTableRow from './components/UserTableRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
    },
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
  })
);

class UsernameAlreadyTakenError {
  constructor(readonly message: string) {}
}

const availableRoles = [Role.ADMIN, Role.CORRECTOR, Role.TUTOR, Role.EMPLOYEE];

/**
 * Converts the given form state to an UserDTO.
 *
 * __Important__: The `otherUsers` array must only contain __other__ users not the one which for example gets edited. This is because the function also checks if the username is already taken by one of the users in `otherUsers` and if it is an `UsernameAlreadyTakenError` is thrown.
 *
 * @param formState State of the UserForm to convert.
 * @param otherUsers Other users to compare usernames with.
 *
 * @throws `UsernameAlreadyTakenError` If the username is already taken by an other user this error gets thrown.
 */
function convertFormStateToUserDTO(
  { firstname, lastname, tutorials, tutorialsToCorrect, roles, username, email }: UserFormState,
  otherUsers: IUser[]
): IUserDTO {
  for (const user of otherUsers) {
    if (user.username.toLowerCase().localeCompare(username.toLowerCase()) === 0) {
      throw new UsernameAlreadyTakenError(`Username ${username} already taken.`);
    }
  }

  return {
    firstname,
    lastname,
    username,
    email,
    roles,
    tutorials,
    tutorialsToCorrect,
  };
}

function convertFailedMailsInfoIntoList(failedMailsInfo: FailedMail[], users: IUser[]): string[] {
  return failedMailsInfo.map((info) => {
    const user = users.find((u) => u.id === info.userId);
    const name = user ? getNameOfEntity(user) : 'USER_NOT_FOUND';
    const reason = info.reason;

    return `${name}: ${reason}`;
  });
}

function UserManagement(): JSX.Element {
  const classes = useStyles();
  const dialog = useDialog();
  const { isMailingActive } = useSettings();
  const { enqueueSnackbar, closeSnackbar, enqueueSnackbarWithList } = useCustomSnackbar();

  const [users = [], isLoadingUsers, , fetchUsers] = useFetchState({
    fetchFunction: getUsers,
    immediate: true,
    params: [],
  });
  const [tutorials = [], isLoadingTutorials, , fetchTutorials] = useFetchState({
    fetchFunction: getAllTutorials,
    immediate: true,
    params: [],
  });

  const [isLoadingInitially, setLoadingInitially] = useState(true);
  const [isSendingCredentials, setSendingCredentials] = useState(false);

  useEffect(() => {
    if (isLoadingInitially && !isLoadingTutorials && !isLoadingUsers) {
      setLoadingInitially(false);
    }
  }, [isLoadingInitially, isLoadingTutorials, isLoadingUsers]);

  const updateData = useCallback(async () => {
    fetchTutorials();
    return fetchUsers();
  }, [fetchUsers, fetchTutorials]);

  const handleCreateUser: UserFormSubmitCallback = useCallback(
    async (formState, { resetForm, setSubmitting, setFieldError }) => {
      try {
        const userToCreate: ICreateUserDTO = {
          ...convertFormStateToUserDTO(formState, users),
          password: formState.password,
        };

        const response = await createUser(userToCreate);
        await updateData();

        enqueueSnackbar(
          `${getNameOfEntity(response, {
            firstNameFirst: true,
          })} wurde erfolgreich angelegt.`,
          { variant: 'success' }
        );
        resetForm();
      } catch (reason) {
        if (reason instanceof UsernameAlreadyTakenError) {
          setFieldError('username', 'Nutzername bereits vergeben.');
        }

        enqueueSnackbar(`Nutzer konnte nicht gespeichert werden.`, { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
    [enqueueSnackbar, updateData, users]
  );

  const handleEditUserSubmit: (user: IUser) => UserFormSubmitCallback = useCallback(
    (user) => async (formState, { setSubmitting, setFieldError }) => {
      try {
        const { password } = formState;
        const userInformation: IUserDTO = convertFormStateToUserDTO(
          formState,
          users.filter((u) => u.id !== user.id)
        );

        const updatedUser = await editUser(user.id, userInformation);

        if (!!password) {
          await setTemporaryPassword(user.id, { password });
        }

        await updateData();

        enqueueSnackbar(
          `${getNameOfEntity(updatedUser, {
            firstNameFirst: true,
          })} wurde erfolgreich gespeichert.`,
          { variant: 'success' }
        );
        dialog.hide();
      } catch (e) {
        if (e instanceof UsernameAlreadyTakenError) {
          setFieldError('username', 'Nutzername bereits vergeben.');
        }

        enqueueSnackbar(`Nutzer konnte nicht gespeichert werden.`, { variant: 'error' });
        setSubmitting(false);
      }
    },
    [dialog, enqueueSnackbar, updateData, users]
  );

  const isLastAdmin = useCallback(
    (user: IUser) => {
      if (user.roles.includes(Role.ADMIN)) {
        const allAdmins = users.filter((u) => u.roles.includes(Role.ADMIN));

        return allAdmins.length <= 1;
      }

      return false;
    },
    [users]
  );

  const handleDeleteUserSubmit = useCallback(
    (user: IUser) => {
      deleteUser(user.id)
        .then(async () => {
          await updateData();
        })
        .finally(() => {
          dialog.hide();
          enqueueSnackbar(`Nutzer wurde erfolgreich gelöscht.`, { variant: 'success' });
        });
    },
    [dialog, enqueueSnackbar, updateData]
  );

  const handleDeleteUser = useCallback(
    (user: IUser) => {
      const nameOfUser = `${user.firstname} ${user.lastname}`;
      dialog.show({
        title: 'Nutzer löschen',
        content: `Soll der Nutzer "${nameOfUser}" wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`,
        actions: [
          {
            label: 'Nicht löschen',
            onClick: () => dialog.hide(),
          },
          {
            label: 'Löschen',
            onClick: () => handleDeleteUserSubmit(user),
            buttonProps: {
              className: classes.dialogDeleteButton,
            },
          },
        ],
      });
    },
    [dialog, classes.dialogDeleteButton, handleDeleteUserSubmit]
  );

  const handleEditUser = useCallback(
    (user: IUser) => {
      dialog.show({
        title: 'Nutzer bearbeiten',
        content: (
          <UserForm
            user={user}
            availableRoles={availableRoles}
            tutorials={tutorials}
            loadingTutorials={isLoadingTutorials}
            onSubmit={handleEditUserSubmit(user)}
            onCancelClicked={() => dialog.hide()}
            disableAdminDeselect={isLastAdmin(user)}
          />
        ),
        DialogProps: {
          maxWidth: 'lg',
        },
      });
    },
    [dialog, handleEditUserSubmit, isLoadingTutorials, tutorials, isLastAdmin]
  );

  const sendCredentials = useCallback(async () => {
    setSendingCredentials(true);

    try {
      const { failedMailsInfo }: MailingStatus = await sendCredentialsRequest();

      if (failedMailsInfo.length === 0) {
        enqueueSnackbar('Zugangsdaten wurden erfolgreich verschickt.', {
          variant: 'success',
        });
      } else {
        const convertedInfo: string[] = convertFailedMailsInfoIntoList(failedMailsInfo, users);

        enqueueSnackbarWithList({
          title: 'Nicht zugestellte Zugangsdaten',
          textBeforeList:
            'Die Zugangsdaten konnten nicht an folgende Nutzer/innen zugestellt werden:',
          items: convertedInfo,
          isOpen: true,
          variant: 'error',
        });
      }
    } catch {
      enqueueSnackbar('Zugangsdaten konnten nicht verschickt werden.', { variant: 'error' });
    }
    setSendingCredentials(false);
  }, [enqueueSnackbar, enqueueSnackbarWithList, users]);

  const handleSendCredentials = useCallback(() => {
    dialog.show({
      title: 'Zugangsdaten verschicken',
      content:
        'Sollen die Zugangsdaten der Nutzer/innen an diese geschickt werden? Dies sendet jedem/r Nutzer/in eine E-Mail mit seinen/ihren Zugangsdaten.',
      actions: [
        {
          label: 'Abbrechen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Senden',
          onClick: () => {
            dialog.hide();
            sendCredentials();
          },
          buttonProps: {
            color: 'primary',
          },
        },
      ],
    });
  }, [dialog, sendCredentials]);

  const handlePrintCredentials = useCallback(async () => {
    setSendingCredentials(true);

    try {
      const blob = await getCredentialsPDF();

      saveBlob(blob, 'Zugangsdaten.pdf');
    } catch {
      enqueueSnackbar('Zugangsdaten PDF konnte nicht erzeugt werden.', { variant: 'error' });
    }

    setSendingCredentials(false);
  }, [enqueueSnackbar]);

  const sendCredentialsToSingleUser = useCallback(
    async (user: IUser) => {
      const snackbarKey = enqueueSnackbar('Verschicke Zugangsdaten...', { variant: 'info' });

      try {
        const status: MailingStatus = await sendCredentialsToSingleUserRequest(user.id);

        closeSnackbar(snackbarKey || undefined);

        if (status.failedMailsInfo.length === 0) {
          enqueueSnackbar('Zugangsdaten erfolgreich verschickt.', { variant: 'success' });
        } else {
          const name = getNameOfEntity(user, { firstNameFirst: true });
          enqueueSnackbar(
            `Zugangsdaten verschicken an ${name} fehlgeschlagen: ${status.failedMailsInfo[0].reason}`,
            { variant: 'error' }
          );
        }
      } catch {
        enqueueSnackbar('Zugangsdaten verschicken fehlgeschlagen.', { variant: 'error' });
      }
    },
    [closeSnackbar, enqueueSnackbar]
  );

  return (
    <div className={classes.root}>
      {isLoadingInitially ? (
        <LoadingSpinner text='Lade Nutzerinnen und Nutzer' />
      ) : (
        <TableWithForm
          title='Neuen Nutzer erstellen'
          placeholder='Keine Nutzer vorhanden.'
          form={
            <UserForm
              availableRoles={availableRoles}
              tutorials={tutorials}
              onSubmit={handleCreateUser}
              loadingTutorials={isLoadingTutorials}
            />
          }
          topBarContent={
            <>
              <SubmitButton
                variant='outlined'
                isSubmitting={isSendingCredentials}
                startIcon={<SendIcon />}
                onClick={handleSendCredentials}
                disabled={!isMailingActive()}
                tooltipText={
                  !isMailingActive() ? 'E-Mails sind serverseitig nicht konfiguriert.' : undefined
                }
              >
                Zugangsdaten verschicken
              </SubmitButton>

              <SubmitButton
                variant='outlined'
                isSubmitting={isSendingCredentials}
                startIcon={<PrintIcon />}
                onClick={handlePrintCredentials}
                style={{ marginLeft: 8 }}
              >
                Zugangsdaten ausdrucken
              </SubmitButton>

              <Button
                variant='outlined'
                component={Link}
                to={ROUTES.IMPORT_USERS.create({})}
                startIcon={<ImportIcon />}
                style={{ marginLeft: 8 }}
              >
                Importieren
              </Button>
            </>
          }
          items={users}
          createRowFromItem={(user) => (
            <UserTableRow
              user={user}
              onEditUserClicked={handleEditUser}
              onDeleteUserClicked={handleDeleteUser}
              onSendCredentialsClicked={sendCredentialsToSingleUser}
              disableSendCredentials={!isMailingActive()}
              disableDelete={isLastAdmin(user)}
            />
          )}
        />
      )}
    </div>
  );
}

export default UserManagement;
