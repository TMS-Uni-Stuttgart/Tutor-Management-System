import { SnackbarKey, useSnackbar } from 'notistack';
import React, { useCallback } from 'react';
import SnackbarWithList, { SnackbarWithListProps } from './SnackbarWithList';

interface Props extends Omit<SnackbarWithListProps, 'id'> {
  persist?: boolean;
}

export interface UseSnackbarWithList {
  enqueueSnackbarWithList: (props: Props) => void;
}

export function useSnackbarWithList(): UseSnackbarWithList {
  const { enqueueSnackbar } = useSnackbar();
  const enqueueSnackbarWithList = useCallback(
    ({ persist, ...otherProps }: Props) => {
      enqueueSnackbar('', {
        persist: persist ?? true,
        content: (id: SnackbarKey) => <SnackbarWithList {...otherProps} id={id} />,
      });
    },
    [enqueueSnackbar]
  );

  return { enqueueSnackbarWithList };
}
