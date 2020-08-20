import { Box, Button, Portal } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

export interface SelectionDialogChildrenProps<T> {
  selected: T | undefined;
  setSelected: (newSelected: T | undefined) => void;
}

interface SelectionDialogContentProps<T> {
  actionRef: React.RefObject<HTMLElement | undefined>;
  children: React.FunctionComponent<SelectionDialogChildrenProps<T>>;
  onAccept: (selected: T | undefined) => void;
  onCancel: () => void;
  disableSelectIfNoneSelected?: boolean;
}

function SelectionDialogContent<T>({
  actionRef,
  children,
  onAccept,
  onCancel,
  disableSelectIfNoneSelected,
}: SelectionDialogContentProps<T>): JSX.Element {
  const [selected, setSelected] = useState<T>();
  const [mountNode, setMountNode] = useState(actionRef.current);

  useEffect(() => {
    setMountNode(actionRef.current);
  }, [actionRef]);

  return (
    <>
      <Box>{children({ selected, setSelected })}</Box>

      <Portal container={mountNode}>
        <Button onClick={onCancel}>Abbrechen</Button>
        <Button
          color='primary'
          onClick={() => onAccept(selected)}
          disabled={disableSelectIfNoneSelected && !selected}
        >
          Auswählen
        </Button>
      </Portal>
    </>
  );
}

export default SelectionDialogContent;
