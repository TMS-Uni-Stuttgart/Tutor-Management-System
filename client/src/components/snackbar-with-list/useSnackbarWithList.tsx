import { SnackbarKey, useSnackbar } from 'notistack';
import React, { useCallback } from 'react';
import SnackbarWithList, { SnackbarWithListProps } from './SnackbarWithList';

interface UseSnackbarWithList {
  showSnackbarWithList: (props: Omit<SnackbarWithListProps, 'id'>) => void;
}

export function useSnackbarWithList() {
  const { enqueueSnackbar } = useSnackbar();
  const enqueueSnackbarWithList = useCallback((props: Omit<SnackbarWithListProps, 'id'>) => {
    enqueueSnackbar('', {
      persist: true,
      content: (id: SnackbarKey) => <SnackbarWithList {...props} id={id} />,
    });
  }, []);

  return { enqueueSnackbarWithList };
}
