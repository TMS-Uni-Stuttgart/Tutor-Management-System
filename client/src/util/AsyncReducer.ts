import { useState } from 'react';

type AsyncReducer<S, A> = (state: S, action: A) => Promise<S>;

export type AsyncDispatch<A> = (action: A) => Promise<void>;

export function useAsyncReducer<S, A>(
  reducer: AsyncReducer<S, A>,
  initialState: S
): [S, AsyncDispatch<A>] {
  const [state, setState] = useState<S>(initialState);

  const dispatch = async (action: A) => {
    try {
      const newState = await reducer(state, action);
      setState(newState);
    } catch (err) {
      throw err;
    }
  };

  return [state, dispatch];
}
