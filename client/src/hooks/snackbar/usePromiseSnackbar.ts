import { useSnackbar } from 'notistack';
import { ReactNode, useCallback } from 'react';

type BaseArrayType = readonly unknown[];

interface RunParams<P extends BaseArrayType, R> {
  /** Function that gets wrapped */
  promiseFunction: (...args: P) => Promise<R>;

  /** If provided, on a success a success snackbar with this as content will be shown. */
  successContent?: ReactNode;

  /** If provided, on an error an error snackbar with this as content will be shown. */
  errorContent?: ReactNode;

  /** If provided it will get called with the thrown error if the `promiseFunction` throws one. If not provided the error gets swalloed. */
  errorHandler?: (error: unknown) => void;
}

type RunFunction = <P extends BaseArrayType, R>(
  params: RunParams<P, R>
) => (...args: P) => Promise<R>;

export interface UsePromiseSnackbar {
  /**
   * Creates and returns a wrapping function for the given `promiseFunction`.
   *
   * The created function returns whatever `promiseFunction` would return if successfully finished and it takes exactly the parameters which the `promiseFunction` would take.
   *
   * On completion of that function and if a `success` message is provided a success snackbar is shown. On error and if an `error` message is provided an error snackbar is shown.
   *
   * Please note that if no `errorHandler` is provided the wrapping function will simply ignore any thrown errors and will swallow them.
   *
   * @returns Async function which calls the given `promiseFunction`.
   */
  promiseWithSnackbar: RunFunction;
}

export function usePromiseSnackbar(): UsePromiseSnackbar {
  const { enqueueSnackbar } = useSnackbar();
  const promiseWithSnackbar: RunFunction = useCallback(
    (params: RunParams<any, any>) => {
      return async (...args: BaseArrayType) => {
        const { promiseFunction, successContent, errorContent, errorHandler } = params;

        try {
          const result = await promiseFunction(...args);

          if (!!successContent) {
            enqueueSnackbar(successContent, { variant: 'success' });
          }

          return result;
        } catch (err) {
          if (!!errorContent) {
            enqueueSnackbar(errorContent, { variant: 'error' });
          }

          if (!!errorHandler) {
            errorHandler(err);
          }
        }
      };
    },
    [enqueueSnackbar]
  );

  return { promiseWithSnackbar };
}
