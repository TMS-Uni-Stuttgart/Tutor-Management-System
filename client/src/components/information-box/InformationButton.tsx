import { Button, ButtonProps, DialogProps } from '@material-ui/core';
import { InformationOutline as InfoIcon } from 'mdi-material-ui';
import React, { useCallback } from 'react';
import { DialogOptions, useDialog } from '../../hooks/dialog-service/DialogService';

interface Props extends Omit<ButtonProps, 'onClick'> {
  information: React.ReactNode;
  title?: string;
  dialogWidth?: DialogProps['maxWidth'];
  DialogProps?: DialogOptions['DialogProps'];
}

function InformationButton({
  title,
  information,
  children,
  dialogWidth,
  DialogProps,
  ...props
}: Props): JSX.Element {
  const { show, hide } = useDialog();

  const handleClicked = useCallback(() => {
    show({
      title,
      content: information,
      actions: [{ label: 'Schließen', onClick: hide }],
      DialogProps: { maxWidth: dialogWidth ?? 'lg', ...DialogProps },
    });
  }, [title, information, show, hide, dialogWidth, DialogProps]);

  return (
    <Button startIcon={<InfoIcon />} {...props} onClick={handleClicked}>
      {children || 'Info'}
    </Button>
  );
}

export default InformationButton;
