import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

export type BaseArrayType = readonly unknown[];

interface UseFetchStateParamsDelayed<T, P extends BaseArrayType> {
  fetchFunction: (...params: P) => Promise<T>;
  immediate?: false;
  params?: never;
}

interface UseFetchStateParamsImmediate<T, P extends BaseArrayType> {
  fetchFunction: (...params: P) => Promise<T>;
  immediate: true;
  params: P;
}

export type UseFetchStateParams<T, P extends BaseArrayType> =
  | UseFetchStateParamsDelayed<T, P>
  | UseFetchStateParamsImmediate<T, P>;

export type FetchFunction<P extends BaseArrayType = []> = (...params: P) => Promise<void>;

export type UseFetchState<T, P extends BaseArrayType> = [
  T | undefined,
  boolean,
  string | undefined,
  FetchFunction<P>
];

export function useFetchState<T, P extends BaseArrayType>({
  fetchFunction,
  immediate,
  params,
}: UseFetchStateParams<T, P>): UseFetchState<T, P> {
  const [value, setValue] = useState<T>();
  const [isLoading, setIsLoading] = useState<boolean>(immediate ?? false);
  const [error, setError] = useState<string>();
  const [prevParams, setPrevParams] = useState<P>();

  const execute = useCallback(
    (...params: P) => {
      setIsLoading(true);
      setError(undefined);

      return fetchFunction(...params)
        .then((response) => setValue(response))
        .catch((error) => setError(error))
        .finally(() => setIsLoading(false));
    },
    [fetchFunction]
  );

  useEffect(() => {
    if (immediate) {
      if (params) {
        // Make a deep equal check to prevent re-executing the callback an 'infinite' times.
        if (!_.isEqual(params, prevParams)) {
          setPrevParams(params);
          execute(...params);
        }
      } else {
        if (execute.length === 0) {
          (execute as any)();
        } else {
          throw new Error(
            `'immediate' is set to true and the 'fetchFunction' expects ${execute.length} arguments but no 'params' where provided`
          );
        }
      }
    }
  }, [execute, immediate, params, prevParams]);

  return [value, isLoading, error, execute];
}
