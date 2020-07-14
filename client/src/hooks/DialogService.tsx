import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { DialogProps } from '@material-ui/core/Dialog';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useContext, useState } from 'react';
import { RequireChildrenProp } from '../typings/RequireChildrenProp';
import { Logger } from '../util/Logger';

const useStyles = makeStyles((theme) =>
  createStyles({
    deleteButton: {
      color: theme.palette.red.main,
    },
  })
);

interface ActionParams {
  label: string;
  onClick: React.MouseEventHandler<HTMLElement>;
  buttonProps?: ButtonProps;
  deleteButton?: boolean;
}

interface DialogOptions {
  title: string;
  content: React.ReactNode;
  actions: ActionParams[];
  onClose?: () => void;
  DialogProps?: Omit<DialogProps, 'open' | 'children'>;
}

interface ConfirmationActionProps {
  label?: string;
  buttonProps?: ButtonProps;
  deleteButton?: boolean;
}

interface ConfirmationDialogOptions {
  title: string;
  content: React.ReactNode;
  cancelProps?: ConfirmationActionProps;
  acceptProps?: ConfirmationActionProps;
  DialogProps?: Omit<DialogProps, 'open' | 'onClose' | 'children'>;
}

export interface DialogHelpers {
  show: (dialogOptions: Partial<DialogOptions>) => void;
  showConfirmationDialog: (diaologOptions: ConfirmationDialogOptions) => Promise<boolean>;
  hide: () => void;
}

type CreateDialogFunction = (dialog: DialogOptions | undefined) => void;

const DialogContext = React.createContext<CreateDialogFunction>(() => {
  Logger.logger.error('Not initialized', { context: 'DialogContext' });
});

const defaultDialog: DialogOptions = {
  title: '__DEFAULT_DIALOG__',
  content: '__DEFAULT_DIALOG_CONTENT__',
  actions: [],
};

let showDialogGlobal: CreateDialogFunction | undefined;
let closeDialogGlobal: (() => void) | undefined;

function DialogService({ children }: RequireChildrenProp): JSX.Element {
  const classes = useStyles();
  const [dialog, setDialog] = useState<DialogOptions | undefined>(undefined);

  function handleSetDialog(dialog: DialogOptions | undefined) {
    setDialog(dialog);
  }

  function handleCloseDialog() {
    if (dialog && dialog.onClose) {
      dialog.onClose();
    }

    setDialog(undefined);
  }

  showDialogGlobal = handleSetDialog;
  closeDialogGlobal = handleCloseDialog;

  return (
    <>
      <DialogContext.Provider value={handleSetDialog}>{children}</DialogContext.Provider>

      {dialog !== undefined && (
        <Dialog open onClose={handleCloseDialog} fullWidth {...dialog.DialogProps}>
          <DialogTitle>{dialog.title}</DialogTitle>

          <DialogContent>
            {typeof dialog.content === 'string' ? (
              <DialogContentText>{dialog.content}</DialogContentText>
            ) : (
              dialog.content
            )}
          </DialogContent>

          <DialogActions>
            {dialog.actions.map((action) => (
              <Button
                key={action.label}
                onClick={action.onClick}
                {...action.buttonProps}
                className={clsx(
                  action.buttonProps?.className,
                  action.deleteButton && classes.deleteButton
                )}
              >
                {action.label}
              </Button>
            ))}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

function showDialogOutsideContext(dialogOptions: Partial<DialogOptions>) {
  if (!showDialogGlobal) {
    Logger.logger.error(
      'There is no function specified for showing a dialog outside the context. You have to include the context to initialize set function.',
      { context: 'DialogService' }
    );
    return;
  }

  showDialogGlobal({ ...defaultDialog, ...dialogOptions });
}

function hideDialogOutsideContext() {
  if (!closeDialogGlobal) {
    Logger.logger.error(
      'There is no function specified for hiding a dialog outside the context. You have to include the context to initialize set function.',
      { context: 'DialogService' }
    );
    return;
  }

  closeDialogGlobal();
}

function useDialog(): DialogHelpers {
  const createDialogFunction = useContext(DialogContext);

  return {
    show: (dialogOptions: Partial<DialogOptions>) => {
      const dialog: DialogOptions = { ...defaultDialog, ...dialogOptions };

      createDialogFunction(dialog);
    },
    showConfirmationDialog: (dialogOptions: ConfirmationDialogOptions) => {
      return new Promise<boolean>((resolve) => {
        const { title, content, cancelProps, acceptProps, DialogProps } = dialogOptions;

        const closeDialog = (isAccepted: boolean) => {
          createDialogFunction(undefined);
          resolve(isAccepted);
        };

        const dialog: DialogOptions = {
          title,
          content,
          actions: [
            {
              ...cancelProps,
              onClick: () => closeDialog(false),
              label: cancelProps?.label ?? 'Nein',
            },
            { ...acceptProps, onClick: () => closeDialog(true), label: acceptProps?.label ?? 'Ja' },
          ],
          DialogProps: { ...DialogProps, onClose: () => closeDialog(false) },
        };

        createDialogFunction(dialog);
      });
    },
    hide: () => createDialogFunction(undefined),
  };
}

function getDialogOutsideContext(): Pick<DialogHelpers, 'show' | 'hide'> {
  return {
    show: showDialogOutsideContext,
    hide: hideDialogOutsideContext,
  };
}

export default DialogService;
export { useDialog, getDialogOutsideContext };
