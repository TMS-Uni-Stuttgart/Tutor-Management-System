import { ProviderContext, useSnackbar } from 'notistack';
import {
  useSnackbarWithList,
  UseSnackbarWithList,
} from '../../components/snackbar-with-list/useSnackbarWithList';
import { useErrorSnackbar, UseErrorSnackbar } from './useErrorSnackbar';
import { usePromiseSnackbar, UsePromiseSnackbar } from './usePromiseSnackbar';

export function useCustomSnackbar(): ProviderContext &
  UseErrorSnackbar &
  UseSnackbarWithList &
  UsePromiseSnackbar {
  const useSnackbarFunctions = useSnackbar();
  const useErrorSnackbarFunctions = useErrorSnackbar();
  const useSnackbarWithListFunctions = useSnackbarWithList();
  const usePromiseSnackbarFunctions = usePromiseSnackbar();

  return {
    ...useSnackbarFunctions,
    ...useErrorSnackbarFunctions,
    ...useSnackbarWithListFunctions,
    ...usePromiseSnackbarFunctions,
  };
}
