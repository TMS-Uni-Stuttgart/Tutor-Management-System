import { SnackbarKey, useSnackbar } from 'notistack';
import React, { useCallback } from 'react';
import SnackbarWithList, { SnackbarWithListProps } from './SnackbarWithList';

export interface UseSnackbarWithList {
  enqueueSnackbarWithList: (props: Omit<SnackbarWithListProps, 'id'>) => void;
}

export function useSnackbarWithList(): UseSnackbarWithList {
  const { enqueueSnackbar } = useSnackbar();
  const enqueueSnackbarWithList = useCallback(
    (props: Omit<SnackbarWithListProps, 'id'>) => {
      enqueueSnackbar('', {
        persist: true,
        content: (id: SnackbarKey) => <SnackbarWithList {...props} id={id} />,
      });
    },
    [enqueueSnackbar]
  );

  return { enqueueSnackbarWithList };
}
