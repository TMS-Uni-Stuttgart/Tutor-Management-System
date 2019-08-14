import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { DialogProps } from '@material-ui/core/Dialog';
import React, { PropsWithChildren, useContext, useState } from 'react';

interface ActionParams {
  label: string;
  onClick: React.MouseEventHandler<HTMLElement>;
  buttonProps?: ButtonProps;
}

interface DialogOptions {
  title: string;
  content: React.ReactNode;
  actions: ActionParams[];
  onClose?: () => void;
  DialogProps?: Omit<DialogProps, 'open' | 'onClose'>;
}

type CreateDialogFunction = (dialog: DialogOptions | undefined) => void;

const DialogContext = React.createContext<CreateDialogFunction>(() => {
  console.error('Not implemented');
});

const defaultDialog: DialogOptions = {
  title: '__DEFAULT_DIALOG__',
  content: '__DEFAULT_DIALOG_CONTENT__',
  actions: [],
};

let showDialogGlobal: CreateDialogFunction | undefined = undefined;
let closeDialogGlobal: (() => void) | undefined = undefined;

function DialogService({ children }: PropsWithChildren<{}>): JSX.Element {
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
            {dialog.actions.map(action => (
              <Button key={action.label} onClick={action.onClick} {...action.buttonProps}>
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
    console.error(
      '[DialogService] -- There is no function specified for showing a dialog outside the context. You have to include the context to initialize set function.'
    );
    return;
  }

  showDialogGlobal({ ...defaultDialog, ...dialogOptions });
}

function hideDialogOutsideContext() {
  if (!closeDialogGlobal) {
    console.error(
      '[DialogService] -- There is no function specified for hiding a dialog outside the context. You have to include the context to initialize set function.'
    );
    return;
  }

  closeDialogGlobal();
}

function useDialog() {
  const createDialogFunction = useContext(DialogContext);

  return {
    show: (dialogOptions: Partial<DialogOptions>) => {
      const dialog: DialogOptions = { ...defaultDialog, ...dialogOptions };

      createDialogFunction(dialog);
    },
    hide: () => createDialogFunction(undefined),
  };
}

export default DialogService;
export { useDialog, showDialogOutsideContext, hideDialogOutsideContext };
