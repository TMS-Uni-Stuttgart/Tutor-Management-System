import { ProviderContext, useSnackbar } from 'notistack';
import {
  useSnackbarWithList,
  UseSnackbarWithList,
} from '../../components/snackbar-with-list/useSnackbarWithList';
import { useErrorSnackbar, UseErrorSnackbar } from './useErrorSnackbar';

export function useCustomSnackbar(): ProviderContext & UseErrorSnackbar & UseSnackbarWithList {
  const useSnackbarFunctions = useSnackbar();
  const useErrorSnackbarFunctions = useErrorSnackbar();
  const useSnackbarWithListFunctions = useSnackbarWithList();

  return { ...useSnackbarFunctions, ...useErrorSnackbarFunctions, ...useSnackbarWithListFunctions };
}
