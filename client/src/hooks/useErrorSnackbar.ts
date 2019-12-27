import { useState, useEffect } from 'react';
import { useSnackbar, OptionsObject } from 'notistack';

interface UseErrorSnackbar {
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
}

/**
 * Hook which returns a function `setError`. If an error text is set a persistent snackbar with that text is shown. This snackbar gets removed if the component gets unloaded or if the text is set to `undefined`.
 *
 * @returns Object containing a React useState dispatch function to set an error text.
 */
export function useErrorSnackbar(): UseErrorSnackbar {
  const [error, setError] = useState<string>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    let snackbar: OptionsObject['key'] | null | undefined = undefined;

    if (error) {
      snackbar = enqueueSnackbar(error, { variant: 'error', persist: true });
    }

    return () => {
      if (!!snackbar) {
        closeSnackbar(snackbar);
      }
    };
  }, [error, enqueueSnackbar, closeSnackbar]);

  return {
    setError,
  };
}
