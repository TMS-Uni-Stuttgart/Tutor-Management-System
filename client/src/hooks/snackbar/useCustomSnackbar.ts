import { useSnackbar } from 'notistack';
import { useSnackbarWithList } from '../../components/snackbar-with-list/useSnackbarWithList';
import { useErrorSnackbar } from './useErrorSnackbar';

export function useCustomSnackbar() {
  const useSnackbarFunctions = useSnackbar();
  const useErrorSnackbarFunctions = useErrorSnackbar();
  const useSnackbarWithListFunctions = useSnackbarWithList();

  return { ...useSnackbarFunctions, ...useErrorSnackbarFunctions, ...useSnackbarWithListFunctions };
}
