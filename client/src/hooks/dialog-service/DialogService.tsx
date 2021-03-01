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
import React, { useCallback, useContext, useRef, useState } from 'react';
import { RequireChildrenProp } from '../../typings/RequireChildrenProp';
import { logger } from '../../util/Logger';
import SelectionDialogContent, {
  SelectionDialogChildrenProps,
} from './components/SelectionDialogContent';

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

export interface DialogOptions {
  title?: string;
  content:
    | React.ReactNode
    | React.FunctionComponent<{ actionRef: React.RefObject<HTMLElement | undefined> }>;
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

interface SelectionDialogOptions<T> {
  title: string;
  content: React.FunctionComponent<SelectionDialogChildrenProps<T>>;
  DialogProps?: Omit<DialogProps, 'open' | 'onClose' | 'children'>;
  disableSelectIfNoneSelected?: boolean;
}

export interface DialogHelpers {
  hide: () => void;
  show: (dialogOptions: Partial<DialogOptions>) => void;
  showConfirmationDialog: (diaologOptions: ConfirmationDialogOptions) => Promise<boolean>;
  showSelectionDialog: <T>(dialogOptions: SelectionDialogOptions<T>) => Promise<T>;
}

type CreateDialogFunction = (dialog: DialogOptions | undefined) => void;

const DialogContext = React.createContext<CreateDialogFunction>(() => {
  logger.error('Not initialized', { context: 'DialogContext' });
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
  const dialogActions = useRef<HTMLElement>();

  const handleSetDialog = useCallback((dialog: DialogOptions | undefined) => {
    setDialog(dialog);
  }, []);

  const handleCloseDialog = useCallback(() => {
    if (dialog && dialog.onClose) {
      dialog.onClose();
    }

    setDialog(undefined);
  }, [dialog]);

  showDialogGlobal = handleSetDialog;
  closeDialogGlobal = handleCloseDialog;

  return (
    <>
      <DialogContext.Provider value={handleSetDialog}>{children}</DialogContext.Provider>

      {dialog !== undefined && (
        <Dialog open onClose={handleCloseDialog} fullWidth {...dialog.DialogProps}>
          {dialog.title && <DialogTitle>{dialog.title}</DialogTitle>}

          <DialogContent>
            {typeof dialog.content === 'string' ? (
              <DialogContentText>{dialog.content}</DialogContentText>
            ) : typeof dialog.content === 'function' ? (
              dialog.content({ actionRef: dialogActions })
            ) : (
              dialog.content
            )}
          </DialogContent>

          <DialogActions ref={dialogActions}>
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
    logger.error(
      'There is no function specified for showing a dialog outside the context. You have to include the context to initialize set function.',
      { context: 'DialogService' }
    );
    return;
  }

  showDialogGlobal({ ...defaultDialog, ...dialogOptions });
}

function hideDialogOutsideContext() {
  if (!closeDialogGlobal) {
    logger.error(
      'There is no function specified for hiding a dialog outside the context. You have to include the context to initialize set function.',
      { context: 'DialogService' }
    );
    return;
  }

  closeDialogGlobal();
}

function useDialog(): DialogHelpers {
  const createDialogFunction = useContext(DialogContext);

  const hide: DialogHelpers['hide'] = useCallback(() => createDialogFunction(undefined), [
    createDialogFunction,
  ]);

  const show: DialogHelpers['show'] = useCallback(
    (dialogOptions: Partial<DialogOptions>) => {
      const dialog: DialogOptions = { ...defaultDialog, ...dialogOptions };
      createDialogFunction(dialog);
    },
    [createDialogFunction]
  );

  const showConfirmationDialog: DialogHelpers['showConfirmationDialog'] = useCallback(
    (dialogOptions: ConfirmationDialogOptions) => {
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
            {
              ...acceptProps,
              onClick: () => closeDialog(true),
              label: acceptProps?.label ?? 'Ja',
            },
          ],
          DialogProps: { ...DialogProps, onClose: () => closeDialog(false) },
        };

        createDialogFunction(dialog);
      });
    },
    [createDialogFunction]
  );

  const showSelectionDialog: DialogHelpers['showSelectionDialog'] = useCallback(
    (dialogOptions: SelectionDialogOptions<any>) => {
      return new Promise<any>((resolve) => {
        const { title, content, DialogProps, disableSelectIfNoneSelected } = dialogOptions;

        const closeDialog = (selected: any) => {
          createDialogFunction(undefined);
          resolve(selected);
        };

        const dialog: DialogOptions = {
          title,
          content: ({ actionRef }) => (
            <SelectionDialogContent
              actionRef={actionRef}
              onAccept={(sel) => closeDialog(sel)}
              onCancel={() => closeDialog(undefined)}
              disableSelectIfNoneSelected={disableSelectIfNoneSelected}
            >
              {content}
            </SelectionDialogContent>
          ),
          actions: [],
          DialogProps: { ...DialogProps, onClose: () => closeDialog(undefined) },
        };

        createDialogFunction(dialog);
      });
    },
    [createDialogFunction]
  );

  return {
    hide,
    show,
    showConfirmationDialog,
    showSelectionDialog,
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
